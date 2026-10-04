import { Route, Routes } from 'react-router-dom'
import { AppProvider } from './state/AppState'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import PracticePage from './pages/PracticePage'
import GrammarPage from './pages/GrammarPage'
import VocabularyPage from './pages/VocabularyPage'
import SettingsPage from './pages/SettingsPage'
import InstallPage from './pages/InstallPage'
import CategoryPage from './pages/CategoryPage'
import ExercisePage from './pages/ExercisePage'
import LessonsPage from './pages/LessonsPage'
import LessonPage from './pages/LessonPage'
import CourseExercisePage from './pages/CourseExercisePage'
import GrammarTopicPage from './pages/GrammarTopicPage'
import TextsPage from './pages/TextsPage'
import TextPage from './pages/TextPage'

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:categoryId" element={<CategoryPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/practice/course" element={<CourseExercisePage />} />
          <Route path="/practice/course/:exerciseId" element={<CourseExercisePage />} />
          <Route path="/practice/:exerciseId" element={<ExercisePage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/*" element={<LessonPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="/grammar/:topicId" element={<GrammarTopicPage />} />
          <Route path="/texts" element={<TextsPage />} />
          <Route path="/texts/:textId" element={<TextPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}
