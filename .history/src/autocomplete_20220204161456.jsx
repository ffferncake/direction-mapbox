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
  const [select, setSelect] = useState();
  let timer;

  useEffect(() => {
    (async () => {
      const result = await axios.get(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${search}&f=json`
      );
      setOptions(result.data.suggestions || [{ text: "default" }]);
    })();
  }, [search]);

  useEffect(() => {
    (async () => {
      const resp = await axios.get(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address=${select}&f=json`
      );
      const result = resp.data.candidates[0];
      if (!result) return;
      console.log(result);
      props.map.current.flyTo({
        center: [result.location.x, result.location.y],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
    })();
  }, [select]);

  return (
    <Autocomplete
      freeSolo
      options={options.map((option) => option.text)}
      onChange={(e) => setSelect(e.target.innerText)}
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
