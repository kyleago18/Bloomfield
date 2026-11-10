export default function ApplicationLogo(props) {
    return (
        <img
            src="/images/logo.png"
            alt="Bloom & Glow Logo"
            className={`rounded-full object-cover ${props.className || 'w-16 h-16 shadow-md'}`}
        />
    );
}
