export default function LoadingScreen() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', gap: '12px'
        }}>
            <span style={{ fontSize: '2.5rem' }}>⏳</span>
            <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Loading...</p>
        </div>
    );
}