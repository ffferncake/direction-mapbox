/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { makeStyles } from "@material-ui/styles";
// export default function autoComplete(props) {
//     const [isOpen, setIsOpen] = useState(false)
//     return ("")
// }

const AutoComplete = (props) => {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [select, setSelect] = useState();
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
      if (!select) return;
      const resp = await axios.get(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?address=${select}&f=json`
      );
      const result = resp.data.candidates[0];
      if (!result) return;
      props.map.current.flyTo({
        center: [result.location.x, result.location.y],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      });
    })();
  }, [select]);

  return (
    <Autocomplete
      // multiple
      freeSolo
      options={options.map((option) => option.text)}
      //   onChange={(e) => setSelect(e.target.innerText)}
      onKeyDown={(e) => {
        // console.log(e.code);
        if (e.code === "Enter") {
          console.log(e.target);
          setSelect(e.target.value);
        }
      }}
      onInputChange={(e) => setSelect(e.target.innerText)}
      renderInput={(params) => (
        <TextField
          {...params}
          label=""
          // variant="filled"
          variant="outlined"
          style={{ fontFamily: "Noto Sans Thai" }}
          placeholder="ค้นหา"
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
      )}
    />
  );
};

export default AutoComplete;
