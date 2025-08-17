import styles from "../../styles/dashboard.module.css";

const DashboardContainer = ({ children }) => {
    return (
        <div className={styles.dashboardContainer}>
            {children}
        </div>
    );
};

export default DashboardContainer;