# ProofMe

ProofMe is a React-based technical skill verification platform.

## Product flow

- Landing page
- Supabase email/password authentication
- Personal user dashboard
- Practical Java, JavaScript and SQL assessments
- DSA coding challenge interface with Monaco Editor
- Real Java judging through the server-side Judge0 route
- Account-specific skill results and coding submissions
- Public shareable skill profile by username
- 50-entry DSA practice library

## Authentication and database

ProofMe uses Supabase Auth and PostgreSQL. Run `supabase-schema.sql` in the Supabase SQL Editor, then copy `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

The browser key is a publishable/anon key, not a service-role key. Never place a service-role key in `VITE_*` variables or in the frontend.

Row Level Security is enabled in the included schema. Private submissions are restricted to their owner; public profiles and their skill scores are intentionally readable so share links work.

## DSA Library

ProofMe includes exactly **50 executable DSA practice problems** with search, topic filters, difficulty filters and pagination.

Every problem has:
- A concrete problem statement
- A Java starter program
- Three visible test cases
- Twelve total judge test cases
- Server-side hidden tests for Submit
- Automatic Accepted/Wrong Answer/Compilation Error reporting

The DSA library covers Arrays, Strings, Linked Lists, Stack, Queue, Binary Search, Trees, Graphs, Heap, Dynamic Programming, Greedy, Backtracking, Bit Manipulation, Math, Sorting and Advanced DSA.

`Run Code` executes the three visible tests. `Submit` executes all twelve tests stored on the server. Hidden tests are not shipped to the browser. Accepted submissions are saved to the signed-in user's Supabase account and update the DSA skill score.

The Java judge uses a LeetCode-style method contract. Each problem provides a `class Solution` starter with a required method signature. Users implement only that method; they do not write `main`, `Scanner`, or standard-input parsing. ProofMe generates a private server-side harness for each problem, calls the method with each test case, and compares the returned value with the expected answer.

## Deployment

Recommended deployment:

1. Create a Supabase project.
2. Run `supabase-schema.sql`.
3. Configure the frontend environment variables in Vercel.
4. Deploy the repository to Vercel.
5. In Supabase Authentication settings, add the deployed Vercel URL to the allowed redirect/site URLs.

## Security

Never put Judge0 authentication tokens, Supabase service-role keys, or other secrets in frontend `VITE_*` environment variables. The current demo uses the official public Judge0 CE endpoint through the server-side `/api/judge` route. For production use, host an authenticated Judge0 instance or use an appropriately secured provider.

## Ownership

Copyright © 2026 Om Deorukhakar. All Rights Reserved.

This project does not intentionally copy third-party application code, designs or assets. Third-party packages remain under their respective licenses.


### DSA library note
The DSA library contains 50 distinct, named executable problems. It intentionally does not present randomized duplicates such as “Array Sum 2”; users choose problems by meaningful names and can read the statement and description before opening the editor.
