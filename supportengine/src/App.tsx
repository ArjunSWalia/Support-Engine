import React, { useState, useEffect, useRef, useContext } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from '@mui/material/Button';
import { Box, TextField, InputBase, colors } from '@mui/material';
import axios from 'axios';
import OpenAI from 'openai';
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




function App() {

  const errorImage = 'https://demofree.sirv.com/nope-not-here.jpg?w=150';

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const [results, useResults] = useState([]);
  const [isValidURL, setValidity] = useState<boolean>(true);
  const [URLPrompt, setURL] = useState<any>("");
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string | null>("");
  const [description, setDescription] = useState<any>("");
  const [description2, setDescription2] = useState<any>("");
  const [Industry, setIndustry] = useState<any>("");
  const HTTP = "http://localhost:8020/chat";
  const [array, setArr] = useState<any>([]);
  const [newElement, setNewElement] = useState<any>();
  const [fetching, setFetching] = useState<boolean>(false);

  const [URLRecs, setURLRecs] = useState<any>('');
  const [recommendations, setRecommendations] = useState<any>('');
  const [output, setOutput] = useState();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [image, setImage] = useState<any>();
  const [updatedImage, setUpdatedImage] = useState<any>();
  const [value, setValue] = useState(50);
  const [productName, setproductName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [otherInudustry, setOtherIndustry] = useState("");
  const [textDescription, setTextDescription] = useState<string | null>("");
  const [advertisement,setAdvertisement] = useState<any>("");
  const Industries = [
    'Pet Care',
    'Travel Agency',
    'Finance',
    'Automobile',
    'Pharmaceuticals',
    'Beauty',
    'Nutrition',
    'Other'
  ];


  //grabs the array initially
  useEffect(() => {
    fetch('http://localhost:3003/get-array')
      .then(response => response.json())
      .then(data => setURLRecs(data));
    fetch('http://localhost:3003/get-array2')
      .then(response => response.json())
      .then(data => setRecommendations(data));
  }, []);


  async function handleAPIRequests(output: any, name: any, input: any) {
    try {
      recommendations.push({ role: "user", content: `In the next recommendation, refer to the product as : ${name} and use this much high-tech slang: ${value}%` });
      recommendations.push({ role: "system", content: `Okay, the next recommendation will refer to the product as ${name} and use ${value}% high-tech slang` });
      recommendations.push({ role: "user", content: output });
      console.log(recommendations);
      const recommendationPromise = await openai.chat.completions.create(
        {
          messages: recommendations,
          model: "gpt-4",
        }
      )
      const textDescriptionPromiseMessage: any = [
        { role: "system", content: `You are a bot that describes products. Please refer to the product as: ${name}, and use ${value} high-tech slang. Please ONLY GENERATE A 80-150 word DESCRIPTION for this product. The description must sound authentic, compelling and natural such that it reflects a personal experience with the product. It also must be conveyed in a personal matter such that you are a person who is making the description, as such please include personal pronouns. Additonally, utilize as many personal connections to each acclaim. If the product provided is not a product please output: \"ERROR\"` },
      ];
      textDescriptionPromiseMessage.push({ role: "user", content: output });
      const textDescriptionPromise = await openai.chat.completions.create(
        {
          messages: textDescriptionPromiseMessage,
          model: "gpt-4",
        }
      );

      const theme: string = darkMode ? "dark" : "light";
      const descriptionPromise = await openai.images.generate(
        {
          model: "dall-e-3",
          prompt: `Given this product:  \`${output}\` create a photo that is sold by a ${input} company, such that it captures the essence of both ideas. Make the foreground focus on the product, and the background focus on the company, make the background also have ${theme} theme`,
        }
      )
      const [promise1, promise2, promise3] = await Promise.all([recommendationPromise, descriptionPromise, textDescriptionPromise]);
      const res: string = promise1.choices[0].message.content ? promise1.choices[0].message.content : " ";
      // if(promise1.choices[0].message.content?.includes("ERROR") || promise3.choices[0].message.content?.includes("ERROR"))
      // {
      //   setValidity(false);
      //   setResponse("I'm sorry, you have entered an invalid product URL, please provide a different link.");
      //   setTextDescription("I'm sorry, you have entered an invalid product URL, please provide a different link.");
      // }
      // else{
      // }
      setResponse(promise1.choices[0].message.content);
      setTextDescription(promise3.choices[0].message.content);
      setValidity(true);
      const descriptionResponse: string = promise2.data[0].url ? promise2.data[0].url : " ";
      // const descriptionResponse2:string = descriptionPromise2.data[0].url ? descriptionPromise2.data[0].url : " ";
      console.log(descriptionResponse);
      setDescription(descriptionResponse);
      // setDescription2(descriptionResponse2);
    }
    catch (error) {
      setDescription(errorImage);
      // setDescription2(errorImage);
      setValidity(false);
      setResponse("I'm sorry I cannot generate an image for this URL.");
      setTextDescription("I'm sorry I cannot generate an image for this URL.");
      setFetching(false);
    }
    finally {
      recommendations.pop();
      recommendations.pop();
      recommendations.pop();
      setFetching(false);
    }

  }

  async function handlePrompt(condition: any) {
    URLRecs.push({ role: "user", content: URLPrompt })
    const validURL = await openai.chat.completions.create(
      {
        messages: URLRecs,
        model: "gpt-4",
      }
    )
    const IndustryParams: any = [
      { role: "system", content: "You are a bot that detects product an industry. For a given industry, output a list of  words that are synonymous to this field and describe the physical aspect of this industry. Each of the words must be separated by a comma. Please produce 5-10 words. Please only list the words seperated by a comma and nothing else." },
      { role: "user", content: "Automobile" },
      { role: "assistant", content: "Sleek, Robust, Streamlined, Rugged, Polished, Aerodynamic, Sturdy, Dynamic, High-performance, Engineered" },
      { role: "user", content: "Fashion" },
      { role: "assistant", content: "Vibrant, Tailored, Flowing, Structured, Ornate, Sleek, Textured, Bold, Elegant, Chic" },
      { role: "user", content: "Nutritionist" },
      { role: "assistant", content: "Healthy, Organic, Fresh, Raw, Wholesome, Nutritious, Balanced, Natural, Hearty, Nourishing" },
      { role: "user", content: "Pet Care" },
      { role: "assistant", content: "Furry, Soft, Playful, Groomed, Fuzzy, Nourished, Playful, Clean, Cuddly, Wholesome" },
      { role: "user", content: "Automotive Repair" },
      { role: "assistant", content: "Mechanical, Greasy, Rugged, Robust, Metallic, Engineered, Heavy-Duty, Technical, Sturdy, Operational" },

    ];
    IndustryParams.push({ role: "user", content: Industry });
    const IndustryArray = await openai.chat.completions.create(
      {
        messages: IndustryParams,
        model: "gpt-4",
      }
    )
    const [promise1, promise2] = await Promise.all([validURL, IndustryArray]);
    const output: any = validURL.choices[0].message.content;
    const IndustryInput = (Industry != "Other") ? Industry : otherInudustry;
    if (output != "INVALID") {
      setPrompt(output);
      setOutput(output);
      await handleAPIRequests(output, productName, IndustryInput);
    }
    else if (output == "INVALID") {
      setFetching(false);
      setResponse("I'm sorry, you have entered an invalid product URL, please provide a different link.");
      setTextDescription("I'm sorry, you have entered an invalid product URL, please provide a different link.");
      setValidity(false);
      setDescription(errorImage);
    }

  }


  async function approvePrompt() {
    const data = `{ role: "user", content: \`${prompt}\`},
    { role: "assistant", content: \`${response}\` },
    `;
    try {
      const response = await fetch('http://localhost:3001/write-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      if (response.ok) {
        console.log("Data has been written to file successfully.");
      } else {
        console.error('Server error');
      }
    }
    catch (error) {
      console.error('Network error:', error);
    }
  }

  async function handleArrayUpdate() {
    try {
      for (let i = 0; i < 2; i++) {
        console.log({ URLRecs });

        const newElement = { role: i == 0 ? "user" : "assistant", content: i == 0 ? prompt : "INVALID" }; // Unique content for each iteration
        const response = await fetch('http://localhost:3003/update-array', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([...URLRecs, newElement]), // Add the new element to the array
        });

        if (response.ok) {
          // Use a callback to correctly update the state based on the previous state
          setURLRecs((prevURLRecs: any) => [...prevURLRecs, newElement]);
        } else {
          console.error('Error updating array');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }

  async function handleArray2Update() {
    try {
      for (let i = 0; i < 2; i++) {
        const newElement = { role: i == 0 ? "user" : "assistant", content: i == 0 ? prompt : response }; // Unique content for each iteration
        const response2 = await fetch('http://localhost:3003/update-array2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([...recommendations, newElement]), // Add the new element to the array
        });

        if (response2.ok) {
          setRecommendations((prevrecommendations: any) => [...recommendations, newElement]);
        } else {
          console.error('Error updating array');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  }




  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setURL(event.target.value);
  };

  const handleIndustryChange = (event: SelectChangeEvent) => {
    setIndustry(event.target.value as string);
  };

  async function handleUpdatedImageChange(image: any) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', `change the background of this image to this ${output}`);
    try {
      const response = await fetch('http://localhost:3005/edit-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      setUpdatedImage(data[0].url);
      console.log(updatedImage);
    } catch (error) {
      console.error('Error:', error);
    }

  }
  const handleImageChange = (e: any) => {
    const image = e.target.files[0];
    setImage(image);
    if (image != null) {
      handleUpdatedImageChange(image);
    }
  }

  const FetchingCondition = () => {
    setFetching(true);
    handlePrompt(fetching);
  }

  const handleChange = (e: any, newValue: any) => {
    setValue(newValue);
    // console.log(value);
  }

  const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setproductName(event.target.value);
    // setValidity(false);
  };

  const handleKeyWordsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
    // setValidity(false);
  };
  const handleOtherIndustryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtherIndustry(event.target.value);
    // setValidity(false);
  };


  async function handleRatingAdvertisement(e: any) {
    const formData = new FormData();
    formData.append('image', description);
    formData.append('image', e.target.files[0].getAsDataURL());
    formData.append('productName',productName);
    try {
      const response = await fetch('http://localhost:3005/rate-advertisement', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setAdvertisement(data);
    } catch (error) {
      console.error('Error:', error);
    }

  }



  return (
    <div className='App'>
      <div>
        <h1 style={{ marginTop: '0px', color: 'white', paddingBottom: '40px' }}>Recommendation Engine</h1>
      </div>
      <TextField
        multiline
        onChange={handleProductNameChange}
        value={productName}
        InputLabelProps={{
          style: { color: '#fff' },
        }}
        label="Product Name"
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
          paddingBottom: '40px'
        }}
      />
      <FormControl sx={{ minWidth: '68%', paddingBottom: '20px' }}>
        <InputLabel sx={{ color: 'white', '&.Mui-focused': { color: 'white' } }}>
          Business Type
        </InputLabel>
        <Select
          value={Industry}
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
          onChange={handleIndustryChange}
        >
          {Industries.map((data) => (
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
      {Industry == "Other" &&
        (
          <TextField
            multiline
            onChange={handleOtherIndustryChange}
            value={otherInudustry}
            InputLabelProps={{
              style: { color: '#fff' },
            }}
            label="Other Industry"
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
              paddingBottom: '10px'
            }}
          />
        )
      }
      <TextField
        multiline
        onChange={handleKeyWordsChange}
        value={keywords}
        InputLabelProps={{
          style: { color: '#fff' },
        }}
        label="Product Keywords"
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
        }}
      />
      <div
        style={{ margin: 'auto', width: '68%', paddingTop: '20px' }}>
        <Slider
          value={value}
          onChange={handleChange}
        />
      </div>

      <div
        style={{ paddingTop: '20px', paddingBottom: '20px' }}
      >
        {
          !darkMode &&
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            size='medium'
            style={{ position: 'fixed', backgroundColor: 'white', color: 'black', borderRadius: '40px', marginLeft: '-50px' }}
          >
            <LightModeIcon fontSize='large' />
          </IconButton>
        }
        {
          darkMode &&
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            size='medium'
            style={{ position: 'fixed', backgroundColor: 'white', color: 'black', borderRadius: '40px', marginLeft: '-50px' }}
          >
            <BedtimeIcon fontSize='large' />
          </IconButton>
        }
        {isValidURL &&
          <TextField
            multiline
            onChange={handleInputChange}
            value={URLPrompt}
            label="URL"
            InputLabelProps={{
              style: { color: '#fff' },
            }}
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
            }}
          />
        }
        {
          !isValidURL &&
          <TextField
            error
            id="outlined-error-helper-text"
            label="URL"
            value={URLPrompt}
            onChange={handleInputChange}
            helperText="Invalid URL"
            sx={{
              width: "68%",
              '& .MuiInputBase-input': {
                color: 'white',
              },

            }}
          />}
      </div>
      <Button id="EnterButton"
        disabled={fetching || !(URLPrompt && Industry && productName)}
        onClick={FetchingCondition}
        sx={{
          width: '68%',
          ...((fetching || !(URLPrompt && Industry && productName)) && {
            backgroundColor: 'grey',
            color: 'white',
          }),
          ...(!(fetching || !(URLPrompt && Industry && productName)) &&
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
      <div
        style={{ display: 'flex', justifyContent: 'left', paddingTop: '20px' }}
      >
        <h1 style={{ color: 'white', fontSize: '30px', margin: 'auto' }}>Product Recommendation:</h1>
        <h1 style={{ color: 'white', fontSize: '30px', margin: 'auto' }}>Product Description:</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'left', paddingTop: '20px' }}>
        <p style={{ color: "white", width: '33%', margin: 'auto', }}>{response ? response : ""}</p>
        <p style={{ color: "white", width: '33%', margin: 'auto', }}>{textDescription ? textDescription : ""}</p>
      </div>
      <Button variant='contained' onClick={handleArrayUpdate} sx={{
        backgroundColor: 'red',
        color: 'white',
        margin: "10px",
        '&:hover': {
          backgroundColor: 'red',
        },
        '&:active': {
          backgroundColor: 'darkred',
        }
      }}>Deny URL</Button>
      <Button variant='contained' onClick={handleArray2Update} sx={{
        backgroundColor: 'red',
        margin: '10px',
        color: 'white',
        '&:hover': {
          backgroundColor: 'red',
        },
        '&:active': {
          backgroundColor: 'darkred',
        }
      }}>Accept Recc</Button>
      <h1 style={{ color: 'white', fontSize: '30px' }}>Product Image:</h1>
      {
        description && <img style={{ width: 512, height: 512 }} src={description}></img>
      }
      {
        description2 && <img style={{ width: 512, height: 512 }} src={description2}></img>
      }
      <input type="file" onChange={handleImageChange}></input>
      {updatedImage && <img src={(updatedImage)} alt="Uploaded" />}
      <Button variant='contained' onClick={handleRatingAdvertisement} sx={{
        backgroundColor: 'red',
        color: 'white',
        margin: "10px",
        '&:hover': {
          backgroundColor: 'red',
        },
        '&:active': {
          backgroundColor: 'darkred',
        }
      }}>Compare Advertisements</Button>
      <p style={{ color: "white", width: '33%', margin: 'auto', }}>{advertisement ? advertisement : ""}</p>
    </div>


  );
}

export default App;
