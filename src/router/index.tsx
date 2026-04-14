import { createBrowserRouter } from 'react-router-dom'
import PlannerPage from '@/pages/PlannerPage'
import HelpPage from '@/pages/HelpPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import DataSourcePage from '@/pages/DataSourcePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PlannerPage />,
  },
  {
    path: '/help',
    element: <HelpPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/data-source',
    element: <DataSourcePage />,
  },
])
