// hooks/useMasking.ts
const maskEmail = (email) => {
  const [user, domain] = email.split("@");
  const maskedUser = user[0] + "*".repeat(user.length - 1);
  const domainParts = domain.split(".");
  const maskedDomain = "*".repeat(domainParts[0].length);
  return `${maskedUser}@${maskedDomain}.${domainParts[1]}`;
};

const maskPhone = (phone) => {
  if (phone.length < 5) return phone;
  return phone.slice(0, 3) + "*".repeat(phone.length - 5) + phone.slice(-2);
};

const maskCCCD = (cccd) => {
  if (cccd.length < 6) return cccd;
  return cccd.slice(0, 3) + "*".repeat(cccd.length - 6) + cccd.slice(-3);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const formatTienPhong = (number) => {
  if (number === undefined || number === null) return "";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const useMasking = () => {
  return {
    maskEmail,
    maskPhone,
    maskCCCD,
    formatDate,
    formatDateInput,
    formatTienPhong,
  };
};
