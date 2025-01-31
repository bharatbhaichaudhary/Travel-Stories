export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.lenght, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};

export const getEmptyCardMessage = (fileType) => {
  switch (fileType) {
    case "search":
      return `Oops! No stoies found matching your search.`;

    case "date":
      return "No stories found in the given date range";

    default:
      `.....`;
  }
};
