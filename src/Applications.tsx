import { useEffect } from 'react'
import SingleApplication from './SingleApplication'
import styles from './Applications.module.css'
import { useApplications } from './hooks/useApplications'
import { Button } from './ui/Button/Button'

const Applications = () => {
  const { fetchApplications, applications, hasMore, loadMore, loading, error } =
    useApplications()

  useEffect(() => {
    fetchApplications(1)
  }, [])

  const renderedApplications = () =>
    applications.map((application) => (
      <SingleApplication key={application.id} application={application} />
    ))

  const renderLoadMoreButton = () => {
    if (hasMore) {
      return (
        <Button disabled={loading} className={styles.button} onClick={loadMore}>
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )
    }
  }

  const renderError = () => {
    if (error) {
      return <div className={styles.error}>{error}</div>
    }
  }

  return (
    <div className={styles.applicationsContainer}>
      <div className={styles.applications}>{renderedApplications()}</div>
      {renderLoadMoreButton()}
      {renderError()}
    </div>
  )
}

export default Applications
