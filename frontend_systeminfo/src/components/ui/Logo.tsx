import Link from 'next/link';
import styles from '../../styles/navbar.module.css'

const Logo = () => {
    return (
        <Link href="/" className={styles.logo}>
            <img src="/icon.png" alt="logo" />
            <h2>System Info</h2>
        </Link>
    );
};

export default Logo;