let transactionData = [];
let sortOrder = 'asc';

function parseHTML() {
  // Create a new HTML document
  const html = $('#htmlInput').val();

  // Get the card data input value
  const cardData = $('#cardInput').val();

  console.log('saving html data in doc')
  const doc = $.parseHTML(html);
  // Find the first table element in the document
  const table = $('table.ember-view', doc)[0];
  outputDiv =  $('#output')

  // If a table was found, parse its data

  if (table) {
  
    // Get the table rows from the table element
    const rows = $(table).find("tr");

    first_row = true
    chequing_account = false
  
    // Loop through each row and create a new row object
    rows.each(function() {
      let rowObj = {}; // create empty object to hold row data
      const cells = $(this).find("td, th");

      if (first_row) {
        chequing_account = cells[2].innerText.trim() == "DEBIT"
        first_row = false
        return;
      }

      cells.each(function(index) {        
        // store cell data in rowObj
        if (index === 0) {
          rowObj.date = parseDate($(this).text().trim());
        } else if (index === 1) {
          rowObj.name = $(this).text().trim();
        } else if (index === 2) {
          // Get the raw amount text
          const rawAmount = $(this).text().trim().replace(/\u2212/g, '-');
          // Remove any non-numeric characters except for '.' and '-'
          var numericAmount = rawAmount.replace( /[^\d.-]+/g, ''); // NOTE there are two different − signs


          if (chequing_account) {
            rowObj.debit = numericAmount == "" ? 0 : parseFloat(numericAmount);
          } else {
            // Parse the numeric amount as a float
            numericAmount = parseFloat(numericAmount);
            if (numericAmount < 0) {
              rowObj.debit = numericAmount * -1
              rowObj.credit = 0
            } else {
              rowObj.debit = 0
              rowObj.credit = numericAmount
            }
          }
        }  else if (index === 3 && chequing_account) {
          // Get the raw amount text
          const rawAmount = $(this).text().trim().replace(/\u2212/g, '-');
          
          // Remove any non-numeric characters except for '.' and '-'
          var numericAmount = rawAmount.replace( /[^\d.-]+/g, ''); // NOTE there are two different − signs

          rowObj.credit = numericAmount == "" ? 0 : parseFloat(numericAmount);
        }
      });
      if ('date' in rowObj && 'name' in rowObj && 'credit' in rowObj && 'debit' in rowObj) {
        rowObj.card = cardData;
        transactionData.push(rowObj); // add rowObj to transactionData array
      }
    });
  }
  console.log(transactionData)
  createTable(transactionData)
}

function createTable() {
  // Clear the output div
  $('#output').empty();
  // Add a button to merge the selected rows
  const mergeButton = $("<button>").text("Merge Selected Rows");
  mergeButton.click(mergeRows);
  const mergeInput = $("<input>").attr("type", "text").attr("placeholder", "Merged Name").attr("id", "mergeInput");
  const mergeContainer = $("<div>").append(mergeInput).append(mergeButton);
  $('#output').prepend(mergeContainer);

  // Add a select element for choosing the month to filter by
  const monthSelect = $("<select>").attr("id", "monthSelect");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  months.forEach(function(month) {
    monthSelect.append($("<option>").attr("value", month).text(month));
  });

  // Add a button for filtering the data by month
  const filterButton = $("<button>").text("Filter by Month").click(filterByMonth);

  // Add the select element and button to the output div
  const filterContainer = $("<div>").append(monthSelect).append(filterButton);
  $('#output').prepend(filterContainer);

  // Create a new table element in the outputDiv
  const outputTable = $("<table>");
  $('#output').append(outputTable);

  // Add a header row to the table
  const headerRow = $("<tr>");
  outputTable.append(headerRow);
  headerRow.append($("<th>").text("Index"));
  headerRow.append($("<th>").text("Merge"));
  let sort_button = $("<button>").attr("id", "sortButton").click(sortByDate)
  if (sortOrder == 'asc') {
    sort_button.text("^")
  } else if (sortOrder == 'desc') {
    sort_button.text("v")
  } else {
    alert("something is wrong with the sort logic")
  }

  headerRow.append($("<th>").text("Date").append(
    sort_button
  ));


  headerRow.append($("<th>").text("Card"));
  headerRow.append($("<th>").text("Name"));
  headerRow.append($("<th>").text("Debit"));
  headerRow.append($("<th>").text("Credit"));
  headerRow.append($("<th>").text("Delete"));

  // Loop through each row of the transaction data and add a row to the table
  transactionData.forEach(function(rowData, rowIndex) {
    const outputRow = $("<tr>");
    outputTable.append(outputRow);

    // Add a cell with the index of the row in the transactionData array
    const indexCell = $("<td>").text(rowIndex);
    outputRow.append(indexCell);

    // Add a checkbox cell for merging the row
    const mergeCell = $("<td>");
    const mergeCheckbox = $("<input>").attr("type", "checkbox").attr("name", "merge").attr("value", rowIndex);
    mergeCell.append(mergeCheckbox);
    outputRow.append(mergeCell);

    // Add cells with the data from the rowData object

    outputRow.append($("<td>").text(formatDate(rowData.date)));
    outputRow.append($("<td>").text(rowData.card));
    outputRow.append($("<td>").text(rowData.name));
    outputRow.append($("<td>").text(rowData.debit));
    outputRow.append($("<td>").text(rowData.credit));

    // Add a delete button cell for deleting the row
    const deleteCell = $("<td>");
    const deleteButton = $("<button>").text("Delete").click(function() {
      deleteRow(rowIndex);
      createTable();
    });
    deleteCell.append(deleteButton);
    outputRow.append(deleteCell);
  });
}

function mergeRows() {
  // Get the selected rows
  const selectedRowIndices = $("input[name=merge]:checked").map(function() {
    return parseInt($(this).val());
  }).get();

  // Merge the selected rows
  if (selectedRowIndices.length > 1) {
    const mergedRow = {
      date: "",
      name: "",
      debit: 0,
      credit: 0
    };
    selectedRowIndices.forEach(function(rowIndex) {
      const rowData = transactionData[rowIndex];
      mergedRow.date = rowData.date;
      mergedRow.name += rowData.name + ", ";
      mergedRow.debit += parseFloat(rowData.debit);
      mergedRow.credit += parseFloat(rowData.credit);
    });
    mergedRow.name = mergedRow.name.slice(0, -2); // remove last ", "

    // Check if the mergeInput has a value
    const mergeInputValue = $("#mergeInput").val();
    if (mergeInputValue) {
      mergedRow.name = mergeInputValue;
    } else {
      mergedRow.name = transactionData[selectedRowIndices[0]].name
    }
    transactionData[selectedRowIndices[0]] = mergedRow;
    for (let i = selectedRowIndices.length - 1; i > 0; i--) {
      transactionData.splice(selectedRowIndices[i], 1);
    }
    createTable();
  } else {
    alert("Please select at least two rows to merge.");
  }
}

function deleteRow(rowIndex) {
  transactionData.splice(rowIndex, 1);
}

function parseDate(str) {
  const [month, day, year] = str.split(/[\s,]+/);
  return new Date(`${month} ${day}, ${year}`);
}

function formatDate(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayOfWeek = days[date.getDay()];
  const month = months[date.getMonth()];
  const dayOfMonth = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${dayOfWeek} ${month} ${dayOfMonth} ${year}`;
}

function filterByMonth() {
  const selectedMonth = $('#monthSelect').val();
  transactionData = transactionData.filter(function(rowData) {
    const dateObj = new Date(rowData.date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    return month === selectedMonth;
  });
  createTable();
}

function sortByDate() {
  if (sortOrder === "asc") {
    transactionData.sort((a, b) => new Date(a.date) - new Date(b.date));
    sortOrder = "desc"
  } else {
    transactionData.sort((a, b) => new Date(b.date) - new Date(a.date));
    sortOrder = "asc"
  }
  createTable();
}