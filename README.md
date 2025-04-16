# Azure DevOps Explorer

A React application built with TypeScript that integrates with Azure DevOps to display project data, work items, and dashboards. The application allows you to connect to your Azure DevOps organization, browse projects, view work items, and see analytics.

## Features

- **Azure DevOps Authentication**: Securely connect to your Azure DevOps organization using a Personal Access Token
- **Project Selection**: View and select from all available projects in your organization
- **Work Items View**: Browse, search, and filter work items by state
- **Dashboard**: Visualize work item statistics with charts and metrics
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- An Azure DevOps account with organization and projects
- A Personal Access Token (PAT) with read permissions for Work Items and Project/Team

### Running the Application

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### How to Get an Azure DevOps Personal Access Token

1. Sign in to your Azure DevOps organization (https://dev.azure.com)
2. Click on your profile picture in the top right corner and select "Personal access tokens"
3. Click on "New Token"
4. Give your token a name and select an appropriate expiration
5. Under "Scopes", select "Custom defined" and grant the following permissions:
   - Work Items: Read
   - Project and Team: Read
6. Click "Create" and copy your token (you won't be able to see it again)

## Technologies Used

This project is built with:

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Build tool and development server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Recharts](https://recharts.org/) - Charting library for data visualization
- [Azure DevOps REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops/) - For integration with Azure DevOps

## Security Note

This application stores your Personal Access Token in localStorage for persistence. While convenient, this approach has security limitations. For a production environment, consider using a more secure token management approach.

## Project Structure

- `/src/components` - UI components
- `/src/contexts` - React context providers
- `/src/services` - Azure DevOps API service
- `/src/utils` - Utility functions
- `/src/pages` - Main application pages

## How to Deploy

Simply open [Lovable](https://lovable.dev/projects/e2cfdfbd-35bc-47c0-b1c9-71e74619a70b) and click on Share -> Publish.

## License

This project is open source and available under the MIT License.
