import React, { Fragment, useState } from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
// Course evals
import QuestionAnswerIcon from "@material-ui/icons/QuestionAnswer";
// Course visible
import Checkbox from "@material-ui/core/Checkbox";
// Delete course
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

// Tracking
import ReactGA from "react-ga";
import { classTimeString } from "../../utils/CourseTimeTransforms";
import URLTypes from "../../constants/URLTypes";
import { gql, useMutation, useQuery } from "@apollo/client";
import { TableBody } from "@material-ui/core";
import CourseDetail from "./CourseDetail";

const createURL = (termcode, crn, type = URLTypes.DETAIL) => {
    switch (type) {
        case URLTypes.DETAIL:
            return `https://courses.rice.edu/courses/!SWKSCAT.cat?p_action=COURSE&p_term=${termcode}&p_crn=${crn}`;
        case URLTypes.EVAL:
            return `https://esther.rice.edu/selfserve/swkscmt.main?p_term=${termcode}&p_crn=${crn}&p_commentid=&p_confirm=1&p_type=Course`;
        default:
            console.log(`Uknown URL type: ${type}`);
            return "https://rice.edu/";
    }
};

const createInstructorURL = (termcode, webID) => {
    return `https://esther.rice.edu/selfserve/swkscmt.main?p_term=${termcode}&p_instr=${webID}&p_commentid=&p_confirm=1&p_type=Instructor`;
};

/**
 * If creditsMax is present (i.e. there is a range of possible credits) then display the range. Otherwise, just display the minimum number of credits.
 */
const creditsDisplay = (creditsMin, creditsMax) => {
    if (creditsMax == null) {
        // Only display credit min
        return <p>{creditsMin}</p>;
    } else {
        return (
            <p>
                {creditsMin} - {creditsMax}
            </p>
        );
    }
};

/**
 * TODO: MOVE THIS TO utils.js
 * @param {instructor} instructors
 * {id: xxx, firstName: xxx, lastName: xxx}
 */
const instructorsToNames = (instructors) => {
    let instructorNames = [];
    for (let instructor of instructors) {
        let instructorName = instructor.firstName + " " + instructor.lastName;
        instructorNames.push(instructorName);
    }
    return instructorNames;
};

const instructorToName = (instructor) => {
    return instructor.firstName + " " + instructor.lastName;
};

/**
 * GraphQL Mutations
 */

/**
 * Toggles the visibility setting for this draft session
 */
const TOGGLE_DRAFT_SESSION_VISIBILITY = gql`
    mutation ToggleCourse($scheduleID: ID!, $sessionID: ID!) {
        scheduleToggleSession(scheduleID: $scheduleID, sessionID: $sessionID) {
            _id
            term
            draftSessions {
                _id
                session {
                    _id
                }
                visible
            }
        }
    }
`;

/**
 * Removes the draft session from the schedule
 */
const REMOVE_DRAFT_SESSION = gql`
    mutation RemoveDraftSession($scheduleID: ID!, $sessionID: ID!) {
        scheduleRemoveSession(scheduleID: $scheduleID, sessionID: $sessionID) {
            _id
            term
            draftSessions {
                _id
                session {
                    _id
                }
                visible
            }
        }
    }
`;

/**
 * GraphQL Queries
 */

/**
 * Fetch the instructors along with their webIds
 */
const FETCH_INSTRUCTORS = gql`
    query WebIDs($termcode: String!) {
        instructorList(termcode: $termcode) {
            firstName
            lastName
            webId
        }
    }
`;

const DraftCourseItem = ({ scheduleID, visible, session, course, idx }) => {
    const emptyCellGenerator = (count) => {
        let cells = [];
        for (let i = 0; i < count; i++) {
            //added key here
            cells.push(<TableCell align="right" key={i}></TableCell>);
        }
        return cells;
    };

    const createSectionTimeCells = (section) => {
        if (!section.startTime || !section.endTime) {
            return <Fragment>{emptyCellGenerator(1)}</Fragment>;
        } else {
            return (
                <Fragment>
                    <TableCell align="right">
                        {section.days}{" "}
                        {classTimeString(section.startTime, section.endTime)}
                    </TableCell>
                </Fragment>
            );
        }
    };

    let [toggleVisibility] = useMutation(TOGGLE_DRAFT_SESSION_VISIBILITY, {
        variables: { scheduleID: scheduleID, sessionID: session._id },
    });

    let [removeDraftSession] = useMutation(REMOVE_DRAFT_SESSION, {
        variables: { scheduleID: scheduleID, sessionID: session._id },
    });

    const { data: instructorsList, loading, error } = useQuery(
        FETCH_INSTRUCTORS,
        {
            variables: { termcode: "202020" },
        }
    );

    /**
     * Get the webId of the instructor
     */
    const webIds = (instructor) => {
        if (instructorsList) {
            let filteredInstructor = instructorsList.instructorList.filter(
                (inst) =>
                    inst.firstName === instructor.firstName &&
                    inst.lastName === instructor.lastName
            );
            if (filteredInstructor.length !== 0) {
                return filteredInstructor[0].webId;
            }
        }
        // If instructor not in current instructor list, return a random webId
        return "281";
    };

    /**
     * Toggle function for toggling the collapsible display of prerequisites and corequisites
     */
    const [open, setOpen] = useState(false);

    const togglePrereq = () => setOpen(!open);

    const boolVisible = visible ? true : false;

    return (
        <TableBody>
            <TableRow key={session.crn}>
                <TableCell padding="checkbox">
                    <Checkbox
                        checked={boolVisible}
                        onClick={() => toggleVisibility()}
                    />
                </TableCell>
                <TableCell align="right" component="th" scope="row">
                    <Tooltip title="View Course Details">
                        <ReactGA.OutboundLink
                            style={{ color: "#272D2D", textDecoration: "none" }}
                            eventLabel="course_description"
                            to={createURL(
                                "202110",
                                session.crn,
                                URLTypes.DETAIL
                            )}
                            target="_blank"
                        >
                            <span style={{ color: "272D2D" }}>
                                {course.longTitle}
                            </span>
                        </ReactGA.OutboundLink>
                    </Tooltip>
                    <Tooltip title="View Evaluations">
                        <ReactGA.OutboundLink
                            eventLabel="course_evaluation"
                            to={createURL("202110", session.crn, URLTypes.EVAL)}
                            target="_blank"
                        >
                            <IconButton aria-label="evaluations">
                                <QuestionAnswerIcon />
                            </IconButton>
                        </ReactGA.OutboundLink>
                    </Tooltip>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={togglePrereq}
                    >
                        {open ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
                <TableCell align="right">{session.crn}</TableCell>
                <TableCell align="right">
                    {creditsDisplay(course.creditsMin, course.creditsMax)}
                </TableCell>
                <TableCell align="right">{course.distribution}</TableCell>
                {createSectionTimeCells(session.class)}
                {createSectionTimeCells(session.lab)}
                <TableCell align="right">
                    {session.instructors.map((instructor) => {
                        let webId = webIds(instructor);
                        return (
                            <Tooltip
                                title="View Instructor Evaluation"
                                key={webId}
                            >
                                <ReactGA.OutboundLink
                                    style={{
                                        color: "#272D2D",
                                        textDecoration: "none",
                                    }}
                                    eventLabel="instructor_evaluation"
                                    to={createInstructorURL("202110", webId)}
                                    target="_blank"
                                >
                                    <span style={{ color: "272D2D" }}>
                                        {instructorToName(instructor)}
                                    </span>
                                </ReactGA.OutboundLink>
                            </Tooltip>
                        );
                    })}
                    {/* {instructorsToNames(session.instructors).join(", ")} */}
                </TableCell>
                <TableCell align="right">
                    <Tooltip title="Delete">
                        <IconButton
                            aria-label="delete"
                            onClick={() => removeDraftSession()}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
            <CourseDetail
                key={idx}
                course={course}
                session={session}
                instructorsToNames={instructorsToNames}
                open={open}
                classTimeString={classTimeString}
            />
        </TableBody>
    );
};

export default DraftCourseItem;
