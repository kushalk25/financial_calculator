let transactionData = [];

function parseHTML() {
  // Create a new HTML document
  const html = $('#htmlInput').val();

  console.log('saving html data in doc')
  const doc = $.parseHTML(html);
  // Find the first table element in the document
  const table = $('table.ember-view', doc)[0];
  console.log('did we get the doc?')
  outputDiv =  $('#output')

  // If a table was found, parse its data

  if (table) {
    console.log('yes we did')
    console.log(transactionData)
  
    // Get the table rows from the table element
    const rows = $(table).find("tr");
  
    // Loop through each row and create a new row object
    rows.each(function() {
      let rowObj = {}; // create empty object to hold row data
      const cells = $(this).find("td, th");
      
      cells.each(function(index) {        
        // store cell data in rowObj
        if (index === 0) {
          rowObj.date = $(this).text().trim();
        } else if (index === 1) {
          rowObj.name = $(this).text().trim();
        } else if (index === 2) {
          rowObj.amount = $(this).text().trim();
        }
      });
      transactionData.push(rowObj); // add rowObj to transactionData array
    });
  }
  console.log(transactionData)
  createTable(transactionData)
}

function createTable(data) {
  const outputTable = $("<table>");
  const headerRow = $("<tr>");
  const headerCells = $("<th>").text("Date").add($("<th>").text("Name")).add($("<th>").text("Amount"));
  headerRow.append(headerCells);
  outputTable.append(headerRow);
  
  for (let i = 0; i < data.length; i++) {
    const row = $("<tr>");
    const cells = $("<td>").text(data[i].date).add($("<td>").text(data[i].name)).add($("<td>").text(data[i].amount));
    row.append(cells);
    outputTable.append(row);
  }
  
  $('#output').empty().append(outputTable);
}
