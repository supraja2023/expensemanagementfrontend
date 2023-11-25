import React, { useState } from 'react';
import axios from 'axios';

const ExpenseForm = () => {
  const [expenses, setExpenses] = useState([
    {
      eid: '',
      category: '',
      description: '',
      amount: 0,
      date: '',
      receipt: null,
    },
  ]);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedExpenses = [...expenses];
    updatedExpenses[index][name] = value;
    setExpenses(updatedExpenses);
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    const updatedExpenses = [...expenses];
    updatedExpenses[index].receipt = file;
    setExpenses(updatedExpenses);
  };

  const handleAddRow = () => {
    setExpenses([...expenses, { eid: '', category: '', description: '', amount: 0, date: '', receipt: null }]);
  };

  const handleRemoveRow = (index) => {
    const updatedExpenses = [...expenses];
    updatedExpenses.splice(index, 1);
    setExpenses(updatedExpenses);
  };

  const handleFormSubmit = async (action) => {
    try {
      const formData = new FormData();

      // Convert expenses to a JSON string and append it to formData
      formData.append('expenses', JSON.stringify(expenses));

      // Append the receipt files to formData
      expenses.forEach((expense) => {
        formData.append('receipts', expense.receipt);
      });

      // Add the action field to indicate the desired action
      formData.append('action', action);

      // Make a single POST request to the server with formData
      const response = await axios.post('http://localhost:8000/upload-expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server response:', response.data);

      // Reset the form after successful submission
      setExpenses([
        {
          eid: '',
          category: '',
          description: '',
          amount: 0,
          date: '',
          receipt: null,
        },
      ]);

      // Reset file input values
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        input.value = ''; // Reset the file input value
      });
    } catch (error) {
      console.error('Error uploading expenses:', error);
    }
  };

  return (
    <div>
      <h1>Expense Form</h1>
      {expenses.map((expense, index) => (
        <div key={index}>
          <label>
            EID:
            <input
              type="text"
              name="eid"
              value={expense.eid}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </label>
          <br />
          <label>
            Category:
            <input
              type="text"
              name="category"
              value={expense.category}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </label>
          <br />
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={expense.description}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </label>
          <br />
          <label>
            Amount:
            <input
              type="number"
              name="amount"
              value={expense.amount}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </label>
          <br />
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </label>
          <br />
          <label>
            Receipt:
            <input type="file" onChange={(e) => handleFileChange(e, index)} />
          </label>
          <br />
          {index === expenses.length - 1 && (
            <button type="button" onClick={handleAddRow}>
              + Add Row
            </button>
          )}
          {index !== 0 && (
            <button type="button" onClick={() => handleRemoveRow(index)}>
              - Remove Row
            </button>
          )}
          <hr />
        </div>
      ))}
      {expenses.length > 0 && (
        <div>
          <button type="button" onClick={() => handleFormSubmit('save')}>
            Save
          </button>
          <button type="button" onClick={() => handleFormSubmit('submit')}>
            Submit for Approval
          </button>
          <button type="button" onClick={() => setExpenses([{ eid: '', category: '', description: '', amount: 0, date: '', receipt: null }])}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
