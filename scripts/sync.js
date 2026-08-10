import axios from "axios";
import fs from "fs";
import { simpleGit } from "simple-git";
import path from "path";

const git = simpleGit();

async function fetchLeetCodeSubmissions() {
  try {
    const response = await axios.post("https://leetcode.com/graphql", {
      query: `
        query {
          submissionList(limit: 100) {
            submissions {
              id
              statusDisplay
              lang
              timestamp
              runtime
              memory
              question {
                questionId
                title
                slug
              }
            }
          }
        }
      `,
    });
    
    return response.data.data.submissionList.submissions.filter(
      (sub) => sub.statusDisplay === "Accepted"
    );
  } catch (error) {
    console.error("Error fetching submissions:", error.message);
    return [];
  }
}

async function syncSolutions(submissions) {
  const trackedFile = "tracked-problems.json";
  let tracked = {};

  if (fs.existsSync(trackedFile)) {
    tracked = JSON.parse(fs.readFileSync(trackedFile, "utf-8"));
  }

  for (const sub of submissions) {
    const problemId = String(sub.question.questionId).padStart(4, "0");
    const problemTitle = sub.question.slug;
    const problemDir = `${problemId}-${problemTitle}`;

    // Skip if already synced with same ID
    if (tracked[problemId] === sub.id) {
      console.log(`✓ Problem ${problemId} already synced`);
      continue;
    }

    // Fetch solution code
    const codeResponse = await axios.post(
      "https://leetcode.com/graphql",
      {
        query: `
          query {
            submissionDetail(submissionId: "${sub.id}") {
              code
            }
          }
        `,
      }
    );

    const code = codeResponse.data.data.submissionDetail.code;
    
    // Create directory and save solution
    if (!fs.existsSync(problemDir)) {
      fs.mkdirSync(problemDir, { recursive: true });
    }

    const fileName = `solution.${getExtension(sub.lang)}`;
    fs.writeFileSync(path.join(problemDir, fileName), code);

    console.log(`📝 Synced: ${problemDir}/${fileName}`);

    // Update tracking
    tracked[problemId] = sub.id;
  }

  // Save tracked problems
  fs.writeFileSync(trackedFile, JSON.stringify(tracked, null, 2));
}

function getExtension(lang) {
  const extensions = {
    python: "py",
    python3: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp",
    csharp: "cs",
    golang: "go",
    rust: "rs",
  };
  return extensions[lang] || "txt";
}

// Main execution
const submissions = await fetchLeetCodeSubmissions();
await syncSolutions(submissions);
console.log("✅ Sync complete!");
