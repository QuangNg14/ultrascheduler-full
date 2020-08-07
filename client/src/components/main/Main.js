import React, { useState, useEffect } from "react";
import Header from "../header/Header";
import CourseCalendar from "../calendar/Calendar";
import ClassSelector from "../draftview/ClassSelector";
import CourseSearch from "../search/CourseSearch";
import { useToasts } from "react-toast-notifications";
import { useQuery, gql, useMutation } from "@apollo/client";
import LoadingScreen from "../LoadingScreen";
import IconButton from "@material-ui/core/IconButton";
import DateRangeIcon from "@material-ui/icons/DateRange";
import ListIcon from "@material-ui/icons/List";

import ButtonGroup from "@material-ui/core/ButtonGroup";

import './Main.global.css';


export const GET_USER_SCHEDULE = gql`
    query GetUserSchedule($term: String!) {
        scheduleOne(filter: { term: $term }) {
            _id
            draftSessions {
                _id
                visible
                session {
                    _id
                    crn
                    class {
                        days
                        startTime
                        endTime
                    }
                    lab {
                        days
                        startTime
                        endTime
                    }
                    enrollment
                    maxEnrollment
                    waitlisted
                    maxWaitlisted
                    instructors {
                        firstName
                        lastName
                    }
                    course {
                        creditsMin
                        creditsMax
                        longTitle
                        subject
                        courseNum
                        distribution
                        coreqs
                        prereqs
                    }
                }
            }
        }
    }
`;

/**
 * This simply fetches from our cache whether a recent update has occurred
 * TODO: CREATE FRAGMENTS / PLACE TO STORE ALL OF THESE SINCE THIS ONE IS ALSO IN ROUTES.JS
 */
const GET_LOCAL_DATA = gql`
    query GetLocalData {
        term @client
        recentUpdate @client
    }
`;

/**
 * Updates the user object field of recentUpdate
 */
const SEEN_RECENT_UPDATE = gql`
    mutation SeenRecentUpdate {
        userUpdateOne(record: { recentUpdate: false }) {
            recordId
        }
    }
`;

// Toast for notifications
const Main = ({ }) => {
    // Check for recent update from cache
    let { data: storeData } = useQuery(GET_LOCAL_DATA);
    let { term, recentUpdate } = storeData;
    const [clickValue, setClickValue] = useState("Calendar");

    // Need to be able to update recentUpdate field on the user when they dismiss
    let [seenRecentUpdate] = useMutation(SEEN_RECENT_UPDATE);

    // Add toast
    let { addToast } = useToasts();

    useEffect(() => {
        if (recentUpdate) {
            let message =
                "We've recently updated our systems to optimize your user experience. \n \
                This required the removal of all current course data. However, courses will now be updated with \
                the latest information every hour.";
            addToast(message, {
                appearance: "info",
                onDismiss: () => seenRecentUpdate(),
            });
        }
    }, [recentUpdate]);

    // Query for the schedule of the user that is logged in
    const { data, loading, error } = useQuery(GET_USER_SCHEDULE, {
        variables: { term: new String(term) },
    });

    if (loading) return <LoadingScreen />;
    if (error) return <p>Error :(</p>;
    if (!data) return <p>No Data...</p>;

    const schedule = data.scheduleOne;

    const handleClick = (e) => {
        setClickValue(e.currentTarget.value);
    };

    const renderContent = () => {
        if (clickValue === "Details") {
            return (
                <div className="Container">
                    <div style={{ float: "right", width: "100%" }}>
                        <CourseSearch scheduleID={schedule._id} clickValue={clickValue} />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="Container">
                    <div style={{width: "30%" }}>
                        <CourseSearch scheduleID={schedule._id} clickValue={clickValue} />
                    </div>
                    <div style={{width: "70%"}}>
                        <CourseCalendar
                            draftSessions={schedule.draftSessions}
                        />
                    </div>
                </div>
            )
        }
    }

    const renderIcons = () => {
        const icons = [<DateRangeIcon />, <ListIcon />]
        const values = ["Calendar", "Details"]

        return (
            icons.map((icon, index) =>
                <IconButton
                    className="iconButton"
                    onClick={handleClick}
                    value={values[index]}
                >
                    {icon}
                </IconButton>
            )
        )
    }

    return (
        <div className="App" style={{ display: "inline", color: "#272D2D" }}>
            <Header />
            <div style={{ padding: "2%" }}>
                <ClassSelector
                    scheduleID={schedule._id}
                    draftSessions={schedule.draftSessions}
                />
            </div>

            <ButtonGroup className="buttonGroup">
                {renderIcons()}
            </ButtonGroup>

            {renderContent()}

        </div>
    );
};

export default Main;
