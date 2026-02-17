import React, { useState } from 'react';

const RegisterWithOTP = () => {
    // --- STATE ---
    const [step, setStep] = useState(1); // 1 = Details, 2 = Verification
    const [role, setRole] = useState('client'); // 'client' or 'supplier'
    const [method, setMethod] = useState('email'); // 'email' or 'sms'
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });

    const [verificationCode, setVerificationCode] = useState(''); // Input by user
    const [serverCode, setServerCode] = useState(null); // Simulated code from backend

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Simulate sending the code
    const handleSendCode = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.email || !formData.phone) {
        alert("Please fill in contact details");
        return;
        }

        // SIMULATION: Generating a 4-digit code
        const mockCode = Math.floor(1000 + Math.random() * 9000);
        setServerCode(mockCode);
        
        // In a real app, you would do: await api.sendSms(formData.phone)
        alert(`[MOCK SERVER] Verification code sent to your ${method}: ${mockCode}`);
        
        // Move to next step
        setStep(2);
    };

    // Step 2: Verify the code
    const handleVerify = (e) => {
        e.preventDefault();
        
        // Check if input matches generated code
        if (parseInt(verificationCode) === serverCode) {
        alert(`Success! Welcome, ${formData.fullName}. You are registered as a ${role.toUpperCase()}.`);
        // Redirect logic goes here...
        } else {
        alert("Error: Invalid code. Please try again.");
        }
    };

    // --- RENDER ---
    return (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
        <h1>Registration</h1>

        {/* STEP 1: User Details */}
        {step === 1 && (
            <form onSubmit={handleSendCode}>
            
            {/* Role Selection */}
            <div style={{ marginBottom: '20px' }}>
                <label>I am a: </label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="client">Client (Homeowner)</option>
                <option value="supplier">Supplier (Tradesperson)</option>
                </select>
            </div>

            {/* Contact Details */}
            <div style={{ marginBottom: '10px' }}>
                <label>Full Name:</label><br/>
                <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Email:</label><br/>
                <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Phone Number:</label><br/>
                <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label>Password:</label><br/>
                <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                />
            </div>

            {/* Verification Method Preference */}
            <div style={{ marginBottom: '20px' }}>
                <label>Send code via: </label>
                <label style={{ marginLeft: '10px' }}>
                <input 
                    type="radio" 
                    name="method" 
                    value="email" 
                    checked={method === 'email'} 
                    onChange={() => setMethod('email')} 
                /> Email
                </label>
                <label style={{ marginLeft: '10px' }}>
                <input 
                    type="radio" 
                    name="method" 
                    value="sms" 
                    checked={method === 'sms'} 
                    onChange={() => setMethod('sms')} 
                /> SMS
                </label>
            </div>

            <button type="submit">Send Verification Code</button>
            </form>
        )}

        {/* STEP 2: Verification */}
        {step === 2 && (
            <form onSubmit={handleVerify}>
            <h3>Verify your account</h3>
            <p>
                We sent a code to your {method === 'email' ? formData.email : formData.phone}.
                <br/>(Check the alert popup for the code)
            </p>

            <div style={{ marginBottom: '10px' }}>
                <label>Enter 4-digit Code:</label><br/>
                <input 
                type="number" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                required 
                />
            </div>

            <button type="submit">Verify & Register</button>
            <br/><br/>
            <button type="button" onClick={() => setStep(1)}>Back</button>
            </form>
        )}
        </div>
    );
};

export default RegisterWithOTP;