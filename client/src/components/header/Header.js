import React from "react";
import Title from "./Title";
import { Button } from "@material-ui/core";
import ReactGA from "react-ga";

import RiceAppsLogo from "../../riceappslogo.png";
import { initGA, OutboundLink } from "../../utils/analytics";

function Header() {
  // Where we collect feedback
  let feedbackURL = "https://forms.gle/6uyRuTxKgP3n53vB6";

  // This initializes Google Analytics
  initGA();

  // Redirects people to our Medium page on a new page if they click our logo to learn more about us
  const handleLogoClick = () => {
    OutboundLink(
      "Clicked Logo.",
      window.open("https://medium.com/riceapps", "_blank")
    );
  };

  return (
    <div style={{ display: "float" }}>
      <div style={{ textAlign: "center" }}>
        <Title />
        <img
          src={RiceAppsLogo}
          style={styles.logo}
          onClick={() => handleLogoClick()}
        />
        <Button
          variant="outlined"
          style={styles.feedback}
          onClick={() => window.open(feedbackURL, "_blank")}
        >
          Feedback?
        </Button>
      </div>
    </div>
  );
}

const styles = {
  feedback: {
    float: "right",
    marginTop: "-50px",
    marginRight: "2vw",
  },
  logo: {
    float: "left",
    marginTop: "-70px",
    marginLeft: "2vw",
    width: "5%",
    height: "5%",
  },
};

export default Header;
