import React, { useState, useEffect, useRef, useContext, KeyboardEvent, ChangeEvent } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';
import { Box, TextField, InputBase, colors, Autocomplete, Chip } from '@mui/material';
import axios from 'axios';
import { Chat } from 'openai/resources';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { upload } from '@testing-library/user-event/dist/upload';
import { url } from 'inspector';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import OpenAI from 'openai';
import io from 'socket.io-client';



const socket = io('http://127.0.0.1:5002'); // Connect to Flask-SocketIO server


interface CustomSelectProps {
    label: string;
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    options: string[];
    disabled: boolean;
}


const SelectInput: React.FC<CustomSelectProps> = (
    {
        label,
        value,
        onChange,
        options,
        disabled
    }
) => {
    return (
        <FormControl sx={{ minWidth: '68%', paddingBottom: '20px' }}>
            <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
                {label}
            </InputLabel>
            <Select
                value={value}
                disabled={disabled}
                label="Business Type"
                sx={{
                    textAlign: 'left',
                    color: "white",
                    borderColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                        borderWidth: '2px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                        borderWidth: '2px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                        borderWidth: '2px',
                    },
                }}
                onChange={onChange}
            >
                {options.map((data) => (
                    <MenuItem
                        key={data}
                        value={data}
                        sx={{ color: 'black' }}
                    >
                        {data}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

function NonLink() {
    const [businessType, setBusinessType] = useState<string>("");
    const [inputValue, setInputValue] = useState<string>('');
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [businessSize, setBusinessSize] = useState<string>("");
    const [fetching, setFetching] = useState<boolean>(false);
    const [Name, setName] = useState<string>("");
    const [response, setResponse] = useState<string | null>("");
    const [conversations, setConversations] = useState<any>('');
    const [answer, setAnswer] = useState<string>("");
    const [fetchingAnswer, setFetchingAnswer] = useState<boolean>(false);
    const [questionCount, setQuestionCount] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [prevDescription, setPrevDescription] = useState<any>([]);
    const [hasGenerated, setHasGenerated] = useState<boolean>(false);
    const [generateFetching, setGenerateFetching] = useState<boolean>(false);
    const [skip, setSkip] = useState<boolean>(true);
    const [skipFetching, setSkipFetching] = useState<boolean>(false);
    const [endConversation, setendConversation] = useState<boolean>(false);
    const [conversed, setConversed] = useState<boolean>(false);
    const [completion, setCompletion] = useState<boolean>(true);
    const [SpeechtoText, setSpeechtoText] = useState<string>("");
    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
    const [transcription, setTranscription] = useState<any>([]);
    const [transcriptionReal, setTranscriptionReal] = useState<any>([]);
    const [toDisplay, settoDisplay] = useState<any>('');
    const [SpeechtoTextresponse, setSpeechtoTextresponse] = useState<any>(false);



    const openai = new OpenAI({
        apiKey: process.env.REACT_APP_API_KEY,
        dangerouslyAllowBrowser: true
    });


    const BusinessTypes = [
        'Service',
        'Product'
    ];
    const BusinessSizes = [
        'Small',
        'Medium',
        'Large'
    ];

    const handleBusinessTypeChange = (event: SelectChangeEvent) => {
        setBusinessType(event.target.value as string);
    };
    const handleBusinessSizeChange = (event: SelectChangeEvent) => {
        setBusinessSize(event.target.value as string);
    };


    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (inputValue && !selectedValues.includes(inputValue)) {
                setSelectedValues([...selectedValues, inputValue]);
                setInputValue('');
            }
        }
    };

    const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    const handleAnswerChange = (event: ChangeEvent<HTMLInputElement>) => {
        setAnswer(event.target.value);
    };

    const handleSpeechChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSpeechtoText(event.target.value);
    }


    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log(toDisplay);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [toDisplay]);

    useEffect(() => {
        const handleTranscriptionResult = (message: any) => {
            setTranscriptionReal(message.array);
            settoDisplay(message.array.join(" "));
            if (message.case) {
                console.log("running?")
                setTranscription((prevTranscription: any) => [...prevTranscription, message.data]);
            } else {
                setTranscription((prevTranscription: any) => {
                    const newTranscription = [...prevTranscription];
                    newTranscription[newTranscription.length - 1] = message.data;
                    return newTranscription;
                });
            }
        };

        socket.on('transcription_result', handleTranscriptionResult);

        return () => {
            socket.off('transcription_result', handleTranscriptionResult);
        };
    }, []);





    async function handlePrompt(condition: any) {
        try {
            const traits = selectedValues.toString();
            const textDescriptionPromiseMessage: any = [
                { role: "system", content: `You are a bot that describes a product or service with great detail in an effort so that it can be used to advertise it!` },
            ];
            textDescriptionPromiseMessage.push({ role: "user", content: `${Name}, which is a ${businessType} from a ${businessSize} sized company. In addition please mention these traits of the ${businessType} when formulating your questions and descripton:: ${traits}` });

            const textDescriptionPromise = await openai.chat.completions.create(
                {
                    messages: textDescriptionPromiseMessage,
                    model: "gpt-4",
                }
            );
            const res: string = textDescriptionPromise.choices[0].message.content ? textDescriptionPromise.choices[0].message.content : "";
            setResponse(res);
        }
        catch (error) {
            console.error(error);
        }
        finally {
        }

    }

    async function handleConversations(condition: any, input: string) {
        try {

            conversations.push({ role: "user", content: input });
            const textDescriptionPromise = await openai.chat.completions.create(
                {
                    messages: conversations,
                    model: "gpt-4",
                }
            );
            const res: string = textDescriptionPromise.choices[0].message.content ? textDescriptionPromise.choices[0].message.content : "";
            if (res.includes('DXYZCR1830:')) {
                setDescription(res.replace('DXYZCR1830:', ' '));
                setResponse("AI question");
                setPrevDescription([...conversations]);
                setHasGenerated(true);
                setConversed(false);
                conversations.push({ role: "assistant", content: res })
            }
            else {
                setResponse(res);
                setDescription("");
                conversations.push({ role: "assistant", content: res })
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setAnswer("");
            setFetching(false);
        }

    }

    async function handleRegenerate(condition: any) {
        try {
            prevDescription.push({ role: "user", content: "Please generate the description now." });
            const textDescriptionPromise = await openai.chat.completions.create(
                {
                    messages: prevDescription,
                    model: "gpt-4",
                }
            );
            const res: string = textDescriptionPromise.choices[0].message.content ? textDescriptionPromise.choices[0].message.content : "";
            setDescription(res.replace('DXYZCR1830:', ''));
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setGenerateFetching(false);
        }
    }

    async function handleSkippingQuestion(condition: any) {
        try {
            conversations.push({ role: "user", content: "SKIP" });
            const textDescriptionPromise = await openai.chat.completions.create(
                {
                    messages: conversations,
                    model: "gpt-4",
                }
            );
            const res: string = textDescriptionPromise.choices[0].message.content ? textDescriptionPromise.choices[0].message.content : "";
            setResponse(res);
            setDescription("");
            conversations.push({ role: "assistant", content: res })

        }
        catch (error) {
            console.error(error);
        }
        finally {
            setSkipFetching(false);
        }
    }

    async function beginConversation() {
        try {
            const traits = selectedValues.toString();
            conversations.push({ role: "user", content: `${Name}, which is a ${businessType} from a ${businessSize} sized company. In addition please mention these traits of the ${businessType} when formulating your questions and descripton:: ${traits}` });
            const textDescriptionPromise = await openai.chat.completions.create(
                {
                    messages: conversations,
                    model: "gpt-4",
                }
            );
            const res: string = textDescriptionPromise.choices[0].message.content ? textDescriptionPromise.choices[0].message.content : "";
            setResponse(res);

        }
        catch (error) {
            console.error(error);
        }
        finally {
            setConversed(true);
        }
    }



    const FetchingCondition = () => {
        setFetching(true);
        handleConversations(fetching, answer);
    }

    const GenerateFetching = () => {
        setGenerateFetching(true);
        handleRegenerate(generateFetching);
    }

    const SkipQuestion = () => {
        setSkipFetching(true);
        handleSkippingQuestion(skipFetching);
    }

    // const startTranscription = () => {
    //     socket.emit('start_transcription');
    //     setIsTranscribing(true);
    // };

    // const stopTranscription = () => {
    //     socket.emit('stop_transcription');
    //     setIsTranscribing(false);
    // };


    async function handleSpeechtoTextAIResponse(condition: any,input:string,input2:any) {
        try {
            let langstyle = '';
            if(input2 == 'Medium')
            {
                langstyle = 'Semi-casual';
            }
            else if(input2 == 'Small')
            {
                langstyle = 'Casual';
            }
            else
            {
                langstyle = 'Formal'
            }
            const textDescriptionPromiseMessage: any = [
                { role: "system", content: `You are a bot that will describe a service. The input will be a rough description of the service in casual language,and you must generate a 80-100 word detailed and exciting description. Please refer to the service as :${input}, and use ${langstyle} style in your description.` },
            ];
            textDescriptionPromiseMessage.push({ role: "user", content: toDisplay });
            const textDescriptionPromise = await openai.chat.completions.create(
                {
                    messages: textDescriptionPromiseMessage,
                    model: "gpt-4",
                }
            );
            const res: string = textDescriptionPromise.choices[0].message.content ? textDescriptionPromise.choices[0].message.content : "";
            setDescription(res);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setSpeechtoTextresponse(false);
        }

    }

    const checkSTT = (condition: any) => {
        console.log(isTranscribing);
        if (isTranscribing && toDisplay) {
            console.log("executed")
            setSpeechtoTextresponse(true);
            handleSpeechtoTextAIResponse(SpeechtoTextresponse,Name,businessSize);
        }

    }

    const startTranscription = () => {
        setIsTranscribing(!isTranscribing);
        fetch('http://127.0.0.1:5002/start_transcription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(response => response.json());
        checkSTT(isTranscribing);
    };



    return (
        <div className='nonLink'>
            <h1 style={{ marginTop: '0px', color: 'white', paddingBottom: '40px' }}>Recommendation Engine</h1>
            <TextField
                multiline
                onChange={handleNameChange}
                value={Name}
                disabled={conversed}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                label="Service Name"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: 'blue',
                        color: 'white',
                        '& fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: 'white',
                    },
                    width: '68%',
                    paddingBottom: '40px',
                }}
            />
            <FormControl sx={{ minWidth: '68%', paddingBottom: '20px' }}>
                {/* <SelectInput
                    label="Business Type"
                    value={businessType}
                    onChange={handleBusinessTypeChange}
                    options={BusinessTypes}
                    disabled={conversed}
                /> */}
                <SelectInput
                    label="Business Size"
                    value={businessSize}
                    onChange={handleBusinessSizeChange}
                    options={BusinessSizes}
                    disabled={conversed}
                />
            </FormControl>
            {/* <Autocomplete
                multiple
                id="tags-filled"
                options={[]}
                disabled={conversed}
                freeSolo
                value={selectedValues}
                //for deletion
                onChange={(event, newValue: string[]) => {
                    setSelectedValues(newValue);
                }}
                inputValue={inputValue}
                onInput={handleInputChange}
                onKeyDown={handleKeyDown}
                renderTags={(value: string[], getTagProps) =>
                    value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })}
                            sx={{ color: 'white', backgroundColor: '#0080ff', }} />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Keywords"
                        multiline
                        InputLabelProps={{
                            style: { color: '#fff' },
                        }}
                        sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-root': {
                                borderColor: 'blue',
                                color: 'white',
                                '& fieldset': {
                                    borderColor: 'white',
                                    borderWidth: '2px',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'white',
                                    borderWidth: '2px',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white',
                                    borderWidth: '2px',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: 'white',
                            },
                            width: '68%',
                            paddingBottom: '40px'
                        }} />
                )}
            /> */}

            <TextField
                multiline
                value={toDisplay}
                disabled={!isTranscribing}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                label="Your Description"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: 'blue',
                        color: 'white',
                        '& fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: 'white',
                    },
                    width: '68%',
                    paddingBottom: '40px',
                }}
            />
            <Button id="SpeechtoTextButton"
                disabled={SpeechtoTextresponse}
                onClick={startTranscription}
                sx={{
                    width: '68%',
                    ...(!isTranscribing && {
                        backgroundColor: 'blue',
                        color: 'white',
                    }),
                    ...(isTranscribing &&
                    {
                        '&:hover': {
                            backgroundColor: '#03a9f4',
                        },
                        backgroundColor: 'red',
                        color: 'white',
                    }),
                }}
            >
                {isTranscribing ? 'Stop Transcribing' : 'Start Transcribing'}
            </Button>
            {/* <p style={{ color: 'white' }}>{toDisplay}</p> */}

            {/* <Button id="ConverseButton"
                disabled={conversed || !(Name && businessSize && businessType && selectedValues.length > 0)}
                onClick={beginConversation}
                sx={{
                    width: '68%',
                    ...((conversed || !(Name && businessSize && businessType && selectedValues.length > 0)) && {
                        backgroundColor: 'grey',
                        color: 'white',
                    }),
                    ...(!(conversed || !(Name && businessSize && businessType && selectedValues.length > 0)) &&
                    {
                        '&:hover': {
                            backgroundColor: '#03a9f4',
                        },
                        backgroundColor: 'blue',
                        color: 'white',
                    }),
                }}
            >
                {conversed ? 'Please Wait' : 'Converse!'}
            </Button> */}



            {/* <div
                style={{ display: 'flex', justifyContent: 'left', paddingBottom: '20px', paddingTop: '20px' }}
            >
                <h1 style={{ color: 'white', fontSize: '30px', margin: 'auto' }}>{response ? response : ""}</h1>
            </div>
            <TextField
                multiline
                onChange={handleAnswerChange}
                value={answer}
                disabled = {!conversed}
                InputLabelProps={{
                    style: { color: '#fff' },
                }}
                label="Answer"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderColor: 'blue',
                        color: 'white',
                        '& fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: 'white',
                    },
                    width: '68%',
                    paddingBottom: '40px',
                    marginLeft: '60px'
                }}
            />
            <Button id="SkipButton"
                disabled={skipFetching || !(skip && conversed)}
                onClick={SkipQuestion}
                sx={{
                    width: '3%',
                    ...((skipFetching || !(skip && conversed)) && {
                        backgroundColor: 'grey',
                        color: 'white',
                    }),
                    ...(!(skipFetching || !(skip && conversed)) &&
                    {
                        '&:hover': {
                            backgroundColor: '#03a9f4',
                        },
                        backgroundColor: 'blue',
                        color: 'white',
                    }),
                    // margin: '20px',
                }}
            >
                {skipFetching ? 'Wait' : 'Skip'}
            </Button>

            <Button id="EnterButton"
                disabled={fetching || !(answer)}
                onClick={FetchingCondition}
                sx={{
                    width: '68%',
                    ...((fetching || !(answer)) && {
                        backgroundColor: 'grey',
                        color: 'white',
                    }),
                    ...(!(fetching || !(answer)) &&
                    {
                        '&:hover': {
                            backgroundColor: '#03a9f4',
                        },
                        backgroundColor: 'blue',
                        color: 'white',
                    }),
                }}
            >
                {fetching ? 'Please Wait' : 'Enter'}
            </Button>
            <Button id="RegenerateButton"
                disabled={generateFetching || !(hasGenerated)}
                onClick={GenerateFetching}
                sx={{
                    width: '68%',
                    ...((generateFetching || !(hasGenerated)) && {
                        backgroundColor: 'grey',
                        color: 'white',
                    }),
                    ...(!(generateFetching || !(hasGenerated)) &&
                    {
                        '&:hover': {
                            backgroundColor: '#03a9f4',
                        },
                        backgroundColor: 'blue',
                        color: 'white',
                    }), margin: '20px',
                }}
            >
                {generateFetching ? 'Please Wait' : 'Regenerate'}
            </Button> */}
            {/* <div
                style={{ display: 'flex', justifyContent: 'left', paddingTop: '20px' }}
            >
                <h1 style={{ color: 'white', fontSize: '30px', margin: 'auto' }}>{businessType ? businessType + " Description" : ""}</h1> 
                <h1 style={{ color: 'white', fontSize: '30px', margin: 'auto' }}>{response ? response : ""}</h1>
            </div> */}

            <div style={{ paddingTop: '20px', textAlign: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '30px' }}>{" Description:"}</h1>
                <p style={{ color: "white", width: '33%', margin: 'auto', fontSize: '20px' }}>{description ? description : ""}</p>
            </div>
        </div>

    );
}

export default NonLink;