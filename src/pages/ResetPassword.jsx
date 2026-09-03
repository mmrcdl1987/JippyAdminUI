import React, { useState } from 'react';
import { resetPasswordByAdminForRoles } from '../services/api'; // Update this path if your api.js file is in a different folder (e.g., './api' or '../api/api')

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    username: '',
    userType: 'MERCHANT',
    newPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Calls the API function cleanly using your pre-configured Axios setup
      await resetPasswordByAdminForRoles(formData);

      setIsSuccess(true);
      setMessage('Password updated successfully!');
      setFormData({ username: '', userType: 'MERCHANT', newPassword: '' });
    } catch (error) {
      setIsSuccess(false);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to reset password. Please try again.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '550px', margin: '0 auto' }}>
      <div style={{ 
        background: '#ffffff', 
        padding: '35px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E5E7EB'
      }}>
        <h2 style={{ marginBottom: '8px', color: '#111827', fontSize: '22px', fontWeight: '600' }}>
          Reset Password
        </h2>
        <p style={{ marginBottom: '24px', color: '#6B7280', fontSize: '14px' }}>
          Update credentials across all system roles.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              Username
            </label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
              placeholder="e.g. mahendra_bulk_test_03"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #D1D5DB', 
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              User Type / Role
            </label>
            <select 
              name="userType" 
              value={formData.userType} 
              onChange={handleChange}
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #D1D5DB', 
                fontSize: '14px', 
                background: '#fff',
                outline: 'none'
              }}
            >
              <option value="MERCHANT">MERCHANT</option>
              <option value="DRIVER">DRIVER</option>
              <option value="OUTLET">OUTLET</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="DEVADMIN">DEVADMIN</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              New Password
            </label>
            <input 
              type="password" 
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleChange} 
              required 
              placeholder="Enter new password (e.g. NewPassword@123)"
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #D1D5DB', 
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#10B981', 
              color: '#fff', 
              padding: '12px 20px', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: '600',
              fontSize: '14px',
              marginTop: '5px',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Submitting...' : 'Submit New Password'}
          </button>
        </form>

        {message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            borderRadius: '6px', 
            background: isSuccess ? '#ECFDF5' : '#FEF2F2', 
            color: isSuccess ? '#047857' : '#DC2626', 
            fontSize: '14px',
            border: `1px solid ${isSuccess ? '#A7F3D0' : '#FECCA7'}`
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;