import { Course, CourseTC, Session, SessionTC } from "../models";
import { getSubjects } from "../utils/courseUtils";

/**
 * THIS IS THE MOST IMPORTANT LINE HERE - IT TOOK ALMOST 2 WEEKS TO GET THIS RIGHT
 * PLEASE DO NOT REMOVE
 * THIS IS THE BEST WAY TO DO RELATIONS WHEN YOU HAVE A SUBFIELD THAT IS A SEPARATE
 * MONGO COLLECTION WHICH LINKS TO THE CURRENT MONGO COLLECTION ON ONE FIELD; YOU JUST HAVE TO
 * DO THIS AND USE THE "source._id" in the "resolve" field (and projection of that _id in the "projection" field)
 * Inspired from: https://github.com/graphql-compose/graphql-compose/issues/176
 * and from: https://github.com/graphql-compose/graphql-compose/issues/94
 */
CourseTC.addFields({
    sessions: {
        type: [SessionTC],
        args: SessionTC.getResolver("findMany").getArgs(),
        resolve: (source, args, context, info) =>
            SessionTC.getResolver("findMany").resolve({
                source,
                // Copy any args the user passes in for this subfield, but also filter by the parent course
                args: {
                    ...args,
                    filter: { ...args.filter, course: source._id },
                },
                context,
                info,
            }),
        projection: {
            _id: true,
        },
    },
});

// CourseTC.addResolver({
//     name: "findManyInSubject",
//     type: [CourseTC],
//     args: { subject: "String!", ascending: "Boolean!" },
//     resolve: async ({ source, args, context, info }) => {
//         // -(field) puts into descending order
//         let sortParam = args.ascending ? "courseNum" : "-courseNum";
//         return await Course.find({ subject: args.subject }).sort(sortParam);
//     }
// })

CourseTC.addResolver({
    name: "findManyInDistribution",
    type: [CourseTC],
    args: { distribution: "String!", ascending: "Boolean!" },
    resolve: async ({ source, args, context, info }) => {
        // -(field) puts into descending order
        let sortParam = args.ascending ? "courseNum" : "-courseNum";
        return await Course.find({ distribution: args.distribution }).sort(
            sortParam
        );
    },
});

const CourseQuery = {
    courseOne: CourseTC.getResolver("findOne"),
    courseMany: CourseTC.getResolver("findMany")
        .addSortArg({
            name: "COURSE_NUM_ASC",
            description: "Simple sort by course number in ascending order.",
            value: { courseNum: 1 },
        })
        .addSortArg({
            name: "COURSE_NUM_DESC",
            description: "Simple sort by course number in descending order.",
            value: { courseNum: -1 },
        })
        .addSortArg({
            name: "SUBJECT_AND_COURSE_NUM_ASC",
            description:
                "Sort by subject then course number in ascending order.",
            value: { subject: 1, courseNum: 1 },
        })
        .addSortArg({
            name: "SUBJECT_AND_COURSE_NUM_DESC",
            description:
                "Sort by subject then course number in descending order.",
            value: { subject: -1, courseNum: -1 },
        })
        .addFilterArg({
            name: "longTitleRegExp", // From here: https://github.com/graphql-compose/graphql-compose-examples/blob/master/examples/northwind/models/product.js#L38,L49
            type: "String",
            description: "Search for a course by a RegExp of its title",
            query: (query, value) => {
                query.longTitle = new RegExp("^.*" + value + ".*", "i"); // case insensitive regex search
            },
        })
        .addFilterArg({
            name: "courseCodeRegExp", // From here: https://github.com/graphql-compose/graphql-compose-examples/blob/master/examples/northwind/models/product.js#L38,L49
            type: "String",
            description:
                "Search for a course by a RegExp of its course code (subject & courseNum)",
            query: (query, value) => {
                // Split value into subject & code
                let [subject, code] = value.split(" ");
                query.subject = new RegExp("^.*" + subject + ".*", "i"); // case insensitive regex search
                query.courseNum = code;
            },
        })
        .addFilterArg({
            name: "courseDistributionRegExp", // From here: https://github.com/graphql-compose/graphql-compose-examples/blob/master/examples/northwind/models/product.js#L38,L49
            type: "String",
            description: "Search for a course by its distribution",
            query: (query, value) => {
                // Split value into subject & code
                let distribution = value;
                console.log(distribution);
                query.distribution = distribution;
            },
        }),
    // courseManyInSubject: CourseTC.getResolver('findManyInSubject'),
    courseManyInDistribution: CourseTC.getResolver("findManyInDistribution"),
    departments: {
        name: "departments",
        type: "[String]",
        args: { term: "Int!" },
        resolve: async (_, args) => {
            return await getSubjects(args.term);
        },
    },
};

const CourseMutation = {
    courseCreateOne: CourseTC.getResolver("createOne"),
};

export { CourseQuery, CourseMutation };
