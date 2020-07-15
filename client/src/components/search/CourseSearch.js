import React, { useState, useEffect } from "react";
import Selection from "./Selection";
import CourseList from "./CourseList";
import { initGA } from "../../utils/analytics";
import { useQuery, gql } from "@apollo/client";
import Button from "@material-ui/core/Button";

const dummy = { label: "", value: "" };

const styles = {
    filter: {
        width: "100%",
    },
    button: {
        display: "inline-block",
        float: "center",
        margin: 8,
        padding: "8px 2px 8px 2px",
        fontSize: "10px",
        backgroundColor: "#e6e6e6",
        boxShadow: "none",
        "border-radius": "25px",
    },
    searchBar: {
        fontSize: "12px",
        display: "inline-block",
    },
    buttons: {
        display: "flex",
    },
};

/**
 * TODO: MAKE A FRAGMENT! THIS IS USED IN TWO PLACES
 * Gets the term from local state management
 */
const GET_TERM = gql`
    query {
        term @client
    }
`;

const GET_DEPARTMENTS = gql`
    query GetDepartments($term: Int!) {
        departments(term: $term)
    }
`;

const CourseSearch = ({ scheduleID }) => {
    const [getDepts, setDepts] = useState([]); // Used for the entire list of departments
    const [getDept, setDept] = useState(dummy); // Used for selection of a particular department

    const [getDist, setDist] = useState(dummy); // Used for selection of a particular distribution

    const [searchType, setSearchType] = useState("Department");

    const searchTypes = ["Department", "Distribution", "Instructors"];

    const allDistributions = [
        { label: "Distribution I", value: "Distribution I" },
        { label: "Distribution II", value: "Distribution II" },
        { label: "Distribution III", value: "Distribution III" },
    ]; // All distributions

    const {
        data: { term },
    } = useQuery(GET_TERM); // Gets the term which we need to request subjects from

    const { data: departmentsData } = useQuery(GET_DEPARTMENTS, {
        variables: { term },
    });

    /**
     * We only want this to run when the subjects list data loads
     */
    useEffect(() => {
        if (departmentsData) {
            let { departments } = departmentsData;
            setDepts(departments.map((dept) => ({ label: dept, value: dept })));
        }
    }, [departmentsData]);

    const handleChange = (selectedOption) => {
        if (searchType == "Distribution") setDist(selectedOption);
        if (searchType == "Department") setDept(selectedOption);
        if (searchType == "Instructor") setDept(selectedOption); // This is a temperary holder for instructors which currently display search by distribution
    };

    const handleChangeSearch = (searchOption) => {
        setSearchType(searchOption);
    };

    // const handleClick = () => {

    // }

    /**
     * Displays the search component based on whether user is searching
     * by distribution or by department
     */
    const displaySearch = () => {
        if (searchType == "Distribution") {
            return (
                <Selection
                    title="Distribution"
                    options={allDistributions}
                    selected={getDist}
                    show={true}
                    handleChange={handleChange}
                />
            );
        } else {
            return (
                <Selection
                    title="Department"
                    options={getDepts}
                    selected={getDept}
                    show={true}
                    handleChange={handleChange}
                />
            );
        }
    };

    /**
     * Displays the course list component based on whether user is searching
     * by distribution or by department
     */
    const displayCourseList = () => {
        if (searchType == "Distribution") {
            return (
                <CourseList
                    scheduleID={scheduleID}
                    type="distribution"
                    distribution={getDist.value}
                />
            );
        } else {
            return (
                <CourseList
                    scheduleID={scheduleID}
                    type="department"
                    department={getDept.value}
                />
            );
        }
    };

    // Initialize Google Analytics
    initGA();

    return (
        <div className="Search">
            <div>
                <div style={styles.filter}>
                    <p size="small" style={styles.searchBar}>
                        {searchType}
                    </p>
                    {displaySearch()}
                </div>
                <div>
                    <b style={{ fontSize: "12px", margin: 8 }}>Search By:</b>
                </div>
                <div style={styles.buttons}>
                    {searchTypes.map((type) => {
                        return (
                            <Button
                                style={styles.button}
                                size="small"
                                variant="contained"
                                onClick={() => handleChangeSearch(`${type}`)}
                            >
                                {type}
                            </Button>
                        );
                    })}
                </div>
            </div>
            {displayCourseList()}
        </div>
    );
};

export default CourseSearch;
