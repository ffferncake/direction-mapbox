/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import axios from 'axios';

// export default function autoComplete(props) {
//     const [isOpen, setIsOpen] = useState(false)
//     return ("")
// }

const autoComplete = (props) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("")
  const loading = open && options.length === 0;

  useEffect(() => {
    (async () => {
        const result = axios.get('')
    })();
  }, [setSearch])
};

export default autoComplete;
