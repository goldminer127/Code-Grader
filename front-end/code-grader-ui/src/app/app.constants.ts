// Landing Page State Values
export enum LANDING_PAGE_STATE {
    HOME = 'home',
    DEFAULT = 'default',
    LOGIN = 'login',
    SIGN_UP = 'signup',
    ABOUT = 'about',
    FEATURES = 'features',
    CONFIRM_SIGN_UP = 'confirmSignUp',
    FORGOT_PASSWORD = 'forgotPassword'
}

export enum WEB_PAGE_THEME {
    DARK_MODE = 'Dark Mode',
    LIGHT_MODE = 'Light Mode'
}

// Application Name
export const APPLICATION_NAME = 'studentCode Grader'

export enum PILLS {
    INSTRUCTOR = 'instructor',
    GRADER = 'grader',
    STUDENT = 'student',
    ALL = 'all'
}

export const BASE_API_URL = 'https://7o49xf1a50.execute-api.us-east-1.amazonaws.com';

export enum COURSE_STATE {
    OVERVIEW = 'overview',
    ASSIGNMENTS = 'assignments',
    SUBMISSIONS = 'submissions',
    ROSTER = 'roster',
    GRADING = 'grading',
    SETTINGS = 'settings',
    NO_STATE = 'noState'
}