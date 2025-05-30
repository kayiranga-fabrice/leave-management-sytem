pipeline {
  agent {
    docker { image 'node:18' }
  }
  environment {
    // Replace the URL below with your actual Render deploy hook URL
    RENDER_DEPLOY_HOOK = 'https://api.render.com/deploy/srv-xxxxxx-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'
  }
  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Install Node.js dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm test'
      }
    }

    stage('Deploy to Render') {
      steps {
        sh """
          curl -X POST -H 'Accept: application/json' ${RENDER_DEPLOY_HOOK}
        """
      }
    }
  }
}
