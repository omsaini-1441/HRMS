// Date utility functions for calendar operations

export const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

export const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isSameDate = (date1, date2) => {
  return date1.toDateString() === date2.toDateString()
}

export const addMonths = (date, months) => {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

export const getDateString = (date) => {
  return date.toISOString().split("T")[0]
}
