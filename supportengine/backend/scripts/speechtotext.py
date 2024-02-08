import asyncio
from flask import Flask, jsonify
from flask_cors import CORS
import sounddevice
from flask_socketio import SocketIO


from amazon_transcribe.client import TranscribeStreamingClient
from amazon_transcribe.handlers import TranscriptResultStreamHandler
from amazon_transcribe.model import TranscriptEvent

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


transcription_results = ['']
toEmit = ''
transcription_active = False
isPartial_count = 0
canSend = True

class MyEventHandler(TranscriptResultStreamHandler):
    async def handle_transcript_event(self, transcript_event: TranscriptEvent):
        global isPartial_count
        global canSend
        global transcription_results
        global toEmit
        global transcription_active
        if transcription_active:            
            results = transcript_event.transcript.results
            for result in results:
                for alt in result.alternatives:
                    transcript = alt.transcript
                    print(canSend)
                    print(transcription_results)
                    print(toEmit)
                    tempresults = list(dict.fromkeys(transcription_results))
                    if tempresults != transcription_results:
                        transcription_results = tempresults
                        transcription_results.append('')
                    socketio.emit('transcription_result', {'data': transcript, 'case': False,'array':transcription_results})
                    socketio.emit('transcription_result',{'data':transcript,'case':False,'array':transcription_results})
                    if (result.is_partial == False and canSend == True):
                        socketio.emit('transcription_result', {'data': transcript, 'case': True,'array':transcription_results})
                        transcription_results.append('')
                        toEmit = transcript
                        canSend = False
                        print("emitting")
                    else:
                        transcription_results[-1] = transcript
                        if(transcription_results[-1] != toEmit and canSend == False):
                            canSend = True

async def mic_stream():
    loop = asyncio.get_event_loop()
    input_queue = asyncio.Queue()

    def callback(indata, frame_count, time_info, status):
        if transcription_active:
            loop.call_soon_threadsafe(input_queue.put_nowait, (bytes(indata), status))
    stream = sounddevice.RawInputStream(
        channels=1,
        samplerate=16000,
        callback=callback,
        blocksize=1024 * 2,
        dtype="int16",
    )
    with stream:
        while transcription_active:
            indata, status = await input_queue.get()
            yield indata, status
        stream.stop()

async def write_chunks(stream):
    async for chunk, status in mic_stream():
        if not transcription_active:
            break
        await stream.input_stream.send_audio_event(audio_chunk=chunk)
    await stream.input_stream.end_stream()


async def basic_transcribe():
    client = TranscribeStreamingClient(region="us-east-1")

    stream = await client.start_stream_transcription(
        language_code="en-US",
        media_sample_rate_hz=16000,
        media_encoding="pcm"
    )

    handler = MyEventHandler(stream.output_stream)
    try:
        while transcription_active:    
            await asyncio.gather(write_chunks(stream), handler.handle_events())
    finally:   
        await stream.input_stream.end_stream()


    

def start_async_transcription():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(basic_transcribe())
    
    
@app.route('/start_transcription', methods=['POST'])
def control_transcription():
    global transcription_active
    global transcription_results
    global toEmit
    global canSend
    global isPartial_count
    if not transcription_active:
        transcription_active = True
        socketio.start_background_task(start_async_transcription)
        return 'Transcription Started'
    else:
        transcription_active = False
        transcription_results = ['']
        toEmit = ''
        return 'Transcription Stopped'

if __name__ == "__main__":
    app.run(debug = True,port = 5002)