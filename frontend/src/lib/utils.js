export function formatMessageTime(date) {
    console.log(`Date is ${date}`)
    return new Date(date).toLocaleString("en-US", {
        hour: "2-digit",
        minute : "2-digit",
        hour12 : false,
    })
};