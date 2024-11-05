export const getRankText = (rank: string) => {
  switch (rank) {
    case "STAFF":
      return "사원";
    case "SENIOR":
      return "주임";
    case "ASSISTANT_MANAGER":
      return "대리";
    case "MANAGER":
      return "팀장";
    case "DEPUTY_GENERAL_MANAGER":
      return "차장";
    case "GENERAL_MANAGER":
      return "본부장";
    case "DIRECTOR":
      return "이사";
    default:
      return rank;
  }
};
