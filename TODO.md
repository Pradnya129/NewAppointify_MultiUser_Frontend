# TODO List for Updating Landing Page Plans API

## Completed Tasks
- [x] Updated fetchPlans function in src/app/Components/LandingPageComponents/Plans.js to use http://localhost:5000/api/admin/plans/all with Bearer token
- [x] Added fetch for http://localhost:5000/api/admin/shift with Bearer token
- [x] Added shifts state to store shift data
- [x] Ensured error handling for both API calls
- [x] Used Promise.all for concurrent fetching

## Pending Tasks
- [ ] Test the component in the browser to ensure plans load correctly from the new API
- [ ] Verify that the token is available in the landing page context (user must be logged in)
- [ ] Check if shift data needs to be displayed or used in the UI
- [ ] Handle cases where token is not available (e.g., redirect to login or show public plans)
