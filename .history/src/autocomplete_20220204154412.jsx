/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import axios from 'axios';

// export default function autoComplete(props) {
//     const [isOpen, setIsOpen] = useState(false)
//     return ("")
// }

const AutoComplete = (props) => {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("")

  useEffect(() => {
    (async () => {
        const result = await axios.get(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${search}&f=json`)
        
    })();
  }, [setSearch])

  return (
    <Autocomplete
    freeSolo
    defaultValue={[{text: 'Selected'}]} 
    options={options.map((option) => option.text)}
    renderInput={(params) => (
        <input onChange={(e) => e.target.value} />
    )}
  />
  )
};

export default AutoComplete;
