import React, { useState,useEffect } from 'react';
import axios from 'axios';

const ApprovalForm = () => {
  const [submittedExpenses, setSubmittedExpenses] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    // Fetch submitted expenses from the server
    const fetchSubmittedExpenses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/getSubmittedExpenses');
        setSubmittedExpenses(response.data);
      } catch (error) {
        console.error('Error fetching submitted expenses:', error);
      }
    };

    fetchSubmittedExpenses();
  }, []);



  const handleStatusChange = (index, newStatus) => {
    // Keep track of changes locally
    const updatedExpenses = [...submittedExpenses];
    updatedExpenses[index].status = newStatus;
    setSubmittedExpenses(updatedExpenses);

    const change = {
      expenseId: submittedExpenses[index]._id,
      action: newStatus === 'approved' ? 'approve' : 'reject',
    };

    // Update pending changes
    const updatedChanges = [...pendingChanges];
    const existingChangeIndex = updatedChanges.findIndex((item) => item.expenseId === change.expenseId);

    if (existingChangeIndex !== -1) {
      updatedChanges[existingChangeIndex] = change;
    } else {
      updatedChanges.push(change);
    }

    setPendingChanges(updatedChanges);
  };

  const handleReasonChange = (index, newReason) => {
    const updatedExpenses = [...submittedExpenses];
    updatedExpenses[index].reason = newReason;
    setSubmittedExpenses(updatedExpenses);
  };

  const handleSaveAll = async () => {
    try {
      // Prepare the payload with updated statuses and reasons
      const payload = pendingChanges.map((change) => ({
        expenseId: change.expenseId,
        action: change.action,
        reason: submittedExpenses.find((expense) => expense._id === change.expenseId)?.reason || '',
      }));

      // Make a single PUT request to update all expenses
      const response = await axios.put('http://localhost:8000/updateStatus', { expenseUpdates: payload });

      console.log('Server response:', response.data);

      // Clear pending changes after successful update
      setPendingChanges([]);
    } catch (error) {
      console.error('Error updating expenses:', error);
    }
  };

  return (
    <div>
      <h1>Submitted Expenses for Approval</h1>
      {submittedExpenses && submittedExpenses.length > 0 ? (
        submittedExpenses.map((expense, index) => (
          <div key={index}>
            <p>EID: {expense.eid}</p>
            <p>Category: {expense.category}</p>
            <p>Description: {expense.description}</p>
            <p>
              Receipt: <a href={expense.receipt} target="_blank" rel="noopener noreferrer">View Receipt</a>
            </p>
            <p>Amount: {expense.amount}</p>
            <p>Date: {expense.date.substring(0,10)}</p>
            {expense.status === 'rejected' && (
              <div>
                <label>Reason for Rejection:</label>
                <input
                  type="text"
                  value={expense.reason}
                  onChange={(e) => handleReasonChange(index, e.target.value)}
                />
              </div>
            )}
            <div>
              <button onClick={() => handleStatusChange(index, 'approved')}>Approve</button>
              <button onClick={() => handleStatusChange(index, 'rejected')}>Reject</button>
            </div>
            <hr />
          </div>
        ))
      ) : (
        <p>No submitted expenses found.</p>
      )}

      {submittedExpenses.length > 0 && (
        <div>
          <button onClick={handleSaveAll}>Save All</button>
        </div>
      )}
    </div>
  );
};

export default ApprovalForm;
