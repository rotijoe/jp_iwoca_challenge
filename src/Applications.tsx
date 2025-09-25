import SingleApplication from './SingleApplication'
import { mockApplications } from './__fixtures__/applications.fixture'
import styles from './Applications.module.css'

const Applications = () => {
  const applications = mockApplications

  return (
    <div className={styles.Applications}>
      <SingleApplication application={applications[0]} />
    </div>
  )
}

export default Applications
