export default defineEventHandler(() => {
    return [
        {
            id: 'starter',
            name: 'Starter',
            monthlyPrice: 99,
            annual: {
                monthlyEquivalent: 83.25,
                billedYearly: 999,
                originalYearly: 1188,
                savings: 189
            },
            extraTeamMembers: 0,
            extraTeamMemberCost: 35,
            exportsPerMonth: 10000,
            exportOverage: 0.02,
            freeSkipTraces: 500,
            skipTraceOverage: 0.08,
            perks: [
                {
                    main: 'Primary user only',
                    detail: '(extra team members for $35/month)'
                },
                {
                    main: 'Save unlimited properties'
                },
                {
                    main: '10,000 exports',
                    lead: '10,000',
                    rest: ' exports',
                    detail: '(additional exports at $0.02 each)'
                },
                {
                    main: '500 free skip traces',
                    lead: '500',
                    rest: ' free skip traces',
                    detail: '(additional skip tracing at $0.08 each)'
                },
                {
                    main: 'Imports $0.01'
                },
                {
                    main: 'FREE daily product trainings and support',
                    lead: 'FREE',
                    rest: ' daily product trainings and support'
                },
                {
                    main: 'Full suite of next-gen investing tools'
                },
                {
                    main: 'Industry first AI powered comp tool'
                },
                {
                    main: 'Includes dedicated support agent'
                }
            ]
        },
        {
            id: 'team',
            name: 'Team',
            monthlyPrice: 249,
            annual: {
                monthlyEquivalent: 207.5,
                billedYearly: 2490,
                originalYearly: 2988,
                savings: 498
            },
            extraTeamMembers: 2,
            extraTeamMemberCost: 25,
            exportsPerMonth: 50000,
            exportOverage: 0.01,
            freeSkipTraces: 1000,
            skipTraceOverage: 0.08,
            perks: [
                {
                    main: 'Primary user + 2 free team members',
                    detail: '(extra team members for $25/month)'
                },
                {
                    main: 'Save unlimited properties'
                },
                {
                    main: '50,000 exports',
                    lead: '50,000',
                    rest: ' exports',
                    detail: '(additional exports at $0.01 each)'
                },
                {
                    main: '1,000 free skip traces',
                    lead: '1,000',
                    rest: ' free skip traces',
                    detail: '(additional skip tracing at $0.08 each)'
                },
                {
                    main: 'Imports $0.01'
                },
                {
                    main: 'FREE daily product trainings and support',
                    lead: 'FREE',
                    rest: ' daily product trainings and support'
                },
                {
                    main: 'Full suite of next-gen investing tools'
                },
                {
                    main: 'Industry first AI powered comp tool'
                },
                {
                    main: 'Includes dedicated support agent'
                }
            ]
        },
        {
            id: 'business',
            name: 'Business',
            monthlyPrice: 549,
            annual: {
                monthlyEquivalent: 457.5,
                billedYearly: 5490,
                originalYearly: 6588,
                savings: 1098
            },
            extraTeamMembers: 6,
            extraTeamMemberCost: 20,
            exportsPerMonth: 100000,
            exportOverage: 0.01,
            freeSkipTraces: 2000,
            skipTraceOverage: 0.08,
            perks: [
                {
                    main: 'Primary user + 6 free team members',
                    detail: '(extra team members for $20/month)'
                },
                {
                    main: 'Save unlimited properties'
                },
                {
                    main: '100,000 exports',
                    lead: '100,000',
                    rest: ' exports',
                    detail: '(additional exports at $0.01 each)'
                },
                {
                    main: '2,000 free skip traces',
                    lead: '2,000',
                    rest: ' free skip traces',
                    detail: '(additional skip tracing at $0.08 each)'
                },
                {
                    main: 'Imports $0.01'
                },
                {
                    main: 'FREE daily product trainings and support',
                    lead: 'FREE',
                    rest: ' daily product trainings and support'
                },
                {
                    main: 'Full suite of next-gen investing tools'
                },
                {
                    main: 'Industry first AI powered comp tool'
                },
                {
                    main: 'Includes dedicated support agent'
                }
            ]
        }
    ]
})
