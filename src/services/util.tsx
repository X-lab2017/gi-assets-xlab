import { isArray } from '@antv/util';

export const getStatement = (queryType, startId, limit) => {
  const formatLimit = limit === 'INFINITY' ? 1000 : limit;
  const idArr = isArray(startId) ? startId : [startId];
  const idArrStr = `[${idArr.join(',')}]`;
  switch (queryType) {
    case 'REPO_NEW_STAR':
      return `MATCH(n)<-[r:star]-(m:github_user) where id(n) = ${startId} with m, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit} RETURN m`;

    case 'REPO_NEW_FORK':
      return `MATCH(n)<-[r:fork]-(m:github_user) where id(n) = ${startId} with m, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit} RETURN m`;

    case 'REPO_NEW_ISSUE':
      return `MATCH(n)-[r:has_issue]->(m:issue) where id(n) = ${startId} with m, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit} RETURN m`;
    case 'REPO_IS_ORGANIZATION':
      return `MATCH(n)<-[r:has_repo]-(m:github_organization) where id(n) = ${startId} RETURN m`;
    case 'REPO_LICENSE_TOPIC':
      return `MATCH(n)-[r:has_topic|use_license]->(m) where id(n) = ${startId} RETURN m`;
    case 'REPOS_COMMON_STAR':
      return `MATCH(n)<-[r1:star]-(m:github_user)-[r2:star]->(k:github_repo) where id(n) in ${idArrStr} AND id(k) in ${idArrStr} RETURN m, r1, r2, n, k LIMIT ${formatLimit}`;

    case 'ORGANIZATION_HAS_REPO':
      return `MATCH(n)-[r:has_repo]->(m:github_repo) where id(n) = ${startId} RETURN m`;

    case 'USER_NEW_STAR':
      return `MATCH(n)-[r:star]->(m:github_repo) where id(n) = ${startId} with m, r.created_at as created_at ORDER by created_at desc LIMIT ${formatLimit} RETURN m`;
    case 'USERS_COMMON_STAR':
      return `MATCH(n)-[r1:star]->(m:github_repo)<-[r2:star]-(k:github_user) where id(n) in ${idArrStr} AND id(k) in ${idArrStr} RETURN m, r1, r2, n, k LIMIT ${formatLimit}`;

    case 'ONE_HOP':
    default:
      return `MATCH(n)-[r]-(m) where id(n) = ${startId} RETURN m LIMIT ${formatLimit}`;
  }
};

export const getEdgeStatement = (queryType, startId, targetId) => {
  switch (queryType) {
    case 'REPO_NEW_STAR':
      return `MATCH (n)<-[r:star]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_NEW_FORK':
      return `MATCH (n)<-[r:fork]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_NEW_ISSUE':
      return `MATCH (n)-[r:has_issue]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_IS_ORGANIZATION':
      return `MATCH (n)<-[r:has_repo]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'REPO_LICENSE_TOPIC':
      return `MATCH (n)-[r:has_topic|use_license]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;

    case 'ORGANIZATION_HAS_REPO':
      return `MATCH (n)-[r:has_repo]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;

    case 'REPOS_COMMON_STAR':
      return `MATCH (n)<-[r:star]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
    case 'USER_NEW_STAR':
      return `MATCH (n)-[r:star]->(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;

    case 'ONE_HOP':
    default:
      return `MATCH (n)-[r]-(m) WHERE id(n) = ${startId} AND id(m) = ${targetId} RETURN n, r, m`;
  }
};
