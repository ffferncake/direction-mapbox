/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";

// export default function autoComplete(props) {
//     const [isOpen, setIsOpen] = useState(false)
//     return ("")
// }

const AutoComplete = (props) => {
  const [options, setOptions] = useState([{ text: "default" }]);
  const [search, setSearch] = useState("");
  let timer;

  const debounce = (callback, timeout = 500) => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("test");
        callback();
      }, timeout);
    };
  };

  useEffect(() => {
    (async () => {
      //   clearTimeout(timer);
      //   timer = setTimeout(async () => {
      //     const result = await axios.get(
      //       `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${search}&f=json`
      //     );
      //     console.log(result.data);
      //   }, 500);
      debounce(() => {
        axios
          .get(
            `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${search}&f=json`
          )
          .then((resp) => {
            console.log(resp);
          });
      });
    })();
  }, [search]);

  return (
    <Autocomplete
      freeSolo
      options={options.map((option) => option.text)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="label"
          variant="filled"
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      )}
    />
  );
};

export default AutoComplete;
