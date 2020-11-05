import React from "react";
import Title from "./Title";
import { Button } from "@material-ui/core";
import ReactGA from "react-ga";
import { useMediaQuery } from "react-responsive";

import RiceAppsLogo from "../../riceappslogo.png";
import { initGA, OutboundLink } from "../../utils/analytics";
import { useHistory } from "react-router";

// This import loads the firebase namespace along with all its type information.
import firebase from "firebase/app";

// These imports load individual services into the firebase namespace.
import "firebase/auth";

function Header() {
    const history = useHistory();

    // Where we collect feedback

    const isDesktopOrLaptop = useMediaQuery({
        query: "(min-device-width: 608px)",
    });

    let feedbackURL = "https://forms.gle/6uyRuTxKgP3n53vB6";
    let logoutURL = "https://idp.rice.edu/idp/profile/cas/logout";

    // This initializes Google Analytics
    initGA();

    // Redirects people to our Medium page on a new page if they click our logo to learn more about us
    const handleLogoClick = () => {
        OutboundLink(
            "Clicked Logo.",
            window.open("https://medium.com/riceapps", "_blank")
        );
    };
    const handleLogoutClick = async () => {
        // Sign out of firebase first
        await firebase.auth().signOut();
        // Sign out of IDP too
        window.open(logoutURL, "_self");
    };
    const handleAboutClick = () => history.push("/about");

    return (
        <div>
            <div style={{ textAlign: "center" }}>
                <Title />
                <img
                    src={RiceAppsLogo}
                    style={styles.logo}
                    onClick={() => handleLogoClick()}
                />
                <div style={styles.wrapper}>
                    <Button
                        variant="outlined"
                        style={
                            isDesktopOrLaptop
                                ? styles.logoutButton
                                : styles.logoutMobile
                        }
                        onClick={handleAboutClick}
                    >
                        About
                    </Button>
                    <Button
                        variant="outlined"
                        style={
                            isDesktopOrLaptop
                                ? styles.logoutButton
                                : styles.logoutMobile
                        }
                        onClick={() => handleLogoutClick()}
                    >
                        Log Out
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => window.open(feedbackURL, "_blank")}
                    >
                        Feedback?
                    </Button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    logo: {
        float: "left",
        marginTop: "-70px",
        marginLeft: "2vw",
        width: "5%",
        height: "5%",
    },
    logoutButton: {
        marginRight: ".5vw",
    },
    wrapper: {
        textAlign: "right",
        width: "95%",
        marginTop: "-50px",
    },
    logoutMobile: {
        float: "left",
        marginLeft: "12vw",
        marginTop: "-50px",
    },
};

export default Header;
