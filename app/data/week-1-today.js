/* Week 1 sample data: the Today list of a made-up company. No real people. */
window.OH_SAMPLE = window.OH_SAMPLE || {}; window.OH_SAMPLE.cc = window.OH_SAMPLE.cc || {};
window.OH_SAMPLE.cc.today = {
  date: OH.today(),
  first: "Call Dana Whitfield about the missed hedge trimming on Tuesday",
  firstDone: false,
  list: [
    { text: "Send Marcus Oyelaran two weekend times for the patio visit", done: true },
    { text: "Answer Priya Raman: move Friday's lawn visit to Thursday or Monday", done: false },
    { text: "Look at the three overdue invoices in QuickBooks", done: false },
    { text: "Tell Luis yes or no about Thursday afternoon", done: false }
  ]
};
