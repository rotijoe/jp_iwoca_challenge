import {
  formatCurrency,
  formatDate,
  formatName
} from './helpers/singleApplication'
import styles from './SingleApplication.module.css'

const SingleApplication = ({ application }) => {
  return (
    <div className={styles.SingleApplication}>
      <div className={styles.cell}>
        <sub>Company</sub>
        <div className={styles.value}>{application.company}</div>
      </div>
      <div className={styles.cell}>
        <sub>Name</sub>
        <div className={styles.value}>
          {formatName(application.first_name, application.last_name)}
        </div>
      </div>
      <div className={styles.cell}>
        <sub>Email</sub>
        <div className={styles.value}>
          <a href={`mailto:${application.email}`} className={styles.emailLink}>
            {application.email}
          </a>
        </div>
      </div>
      <div className={styles.cell}>
        <sub>Loan amount</sub>
        <div className={styles.value}>
          {formatCurrency(application.loan_amount)}
        </div>
      </div>
      <div className={styles.cell}>
        <sub>Application date</sub>
        <div className={styles.value}>
          {formatDate(application.date_created)}
        </div>
      </div>
      <div className={styles.cell}>
        <sub>Expiry date</sub>
        <div className={styles.value}>
          {formatDate(application.expiry_date)}
        </div>
      </div>
    </div>
  )
}

export default SingleApplication
