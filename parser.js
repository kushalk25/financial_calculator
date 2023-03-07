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
    // Create a new table element in the outputDiv
    const outputTable = $("<table>");
    outputDiv.append(outputTable);

    // Get the table rows from the table element
    const rows = $(table).find("tr");

    // Loop through each row and create a new row in the output table
    rows.each(function() {
      const outputRow = $("<tr>");
      $(outputTable).append(outputRow);

      // Get the cells from the row and create new cells in the output row
      const cells = $(this).find("td, th");
      cells.each(function() {
        const outputCell = $("<td>").text($(this).text());
        $(outputRow).append(outputCell);
      });
    });
  }
}



