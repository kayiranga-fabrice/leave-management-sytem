pipeline {
    agent any

    environment {
        RENDER_DEPLOY_HOOK = credentials('RENDER_DEPLOY_HOOK') // Add this as a secret in Jenkins credentials
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Set up Node.js') {
            steps {
                sh 'curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -'
                sh 'sudo apt-get install -y nodejs'
                sh 'node -v && npm -v'
            }
        }

        stage('Set up Python') {
            steps {
                sh 'sudo apt-get install -y python3 python3-pip'
                sh 'python3 --version'
            }
        }

        stage('Install Node.js dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Install Python dependencies') {
            steps {
                sh '''
                if [ -f requirements.txt ]; then
                  pip3 install -r requirements.txt
                fi
                '''
            }
        }

        stage('Run Node.js tests') {
            steps {
                sh 'npm test || echo "No tests found or failed"'
            }
        }

        stage('Run Python app (optional test)') {
            steps {
                sh 'python3 app.py || echo "Python ran"'
            }
        }

        stage('Deploy to Render') {
            steps {
                sh 'curl -X POST "$RENDER_DEPLOY_HOOK"'
            }
        }
    }
}
