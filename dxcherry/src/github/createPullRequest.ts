import { client } from './createClient';
import { getUser } from '../github/getters';
import { getBranchName } from '../git/branch';
import { REPO_DATA } from './config';

async function setLabels (issue_number: number, labels: string[]) {
  await client.issues.setLabels(Object.assign({}, REPO_DATA, { issue_number, labels }));
};

async function addAssign (issue_number: number, assignees: string[]) {
  await client.issues.addAssignees(Object.assign({}, REPO_DATA, { issue_number, assignees }));
};

async function addReviewers (pull_number: number, reviewers: string[]) {
  await client.pulls.requestReviewers(Object.assign({}, REPO_DATA, { pull_number, reviewers }));
};

function createPullRequest ({ title, description, versions, reviewers, labels }: any) {
  versions.forEach(async (version: string) => {
    const { login } = await getUser();
    const branch = await getBranchName();

    const pullRequest = await client.pulls.create(Object.assign({},
      REPO_DATA, {
        base: version,
        head: `${login}:${branch}`,
        title,
        body: description
      }));
    if (pullRequest.status === 201) {
      console.log('Pull request created!');
    } else {
      console.log('An error occured!');
    }
    const pullRequestNumber = pullRequest.data.number;

    await setLabels(pullRequestNumber, [...labels, version]);
    await addAssign(pullRequestNumber, [login]);
    await addReviewers(pullRequestNumber, reviewers);
  });
};

export {
  createPullRequest
};
