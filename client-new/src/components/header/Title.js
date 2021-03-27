import React from "react";
import { useHistory } from "react-router";

function Title() {
    const history = useHistory();

    const handleClick = () => history.push("/schedule");

    return (
        <h1 style={{ cursor: "pointer" }} onClick={handleClick}>hatch.</h1>
    );
}

export default Title;