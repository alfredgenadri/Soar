export const translations = {
  en: {
    header: {
      login: 'Log in',
      signup: 'Sign up',
      resources: 'Resources',
      assistant: 'Assistant',
      feedback: 'Feedback',
      account: {
        profile: 'Profile',
        settings: 'Settings',
        deleteAccount: 'Delete account',
        logout: 'Logout'
      }
    },
    chat: {
      title: 'Chat with Assistant',
      newChat: 'New Chat',
      startConversation: 'Start a new conversation',
      noConversations: 'No conversations yet',
      sendMessage: 'Send',
      typeMessage: 'Type your message...',
      loading: 'Assistant is typing...',
      errorMessage: 'Failed to send message',
      retryButton: 'Retry',
      deleteConversation: 'Delete conversation',
      conversationDeleted: 'Conversation deleted successfully'
    },
    resources: {
      title: 'Mental Health Resources',
      description: 'Find support and help when you need it',
      emergency: 'Emergency',
      callButton: 'Call',
      textButton: 'Text',
      websiteButton: 'Website',
      1: {
        name: '911 Emergency Services',
        description: 'For immediate emergency assistance. Available 24/7 for life-threatening situations and severe mental health crises.'
      },
      2: {
        name: '988 Suicide & Crisis Lifeline',
        description: '24/7 confidential support for anyone experiencing mental health-related distress or thoughts of suicide.'
      },
      3: {
        name: 'uOttawa Health and Wellness',
        description: 'Professional counselling and mental health support services for uOttawa students.'
      }
    },
    feedback: {
      title: 'Share Your Feedback',
      description: 'We value your feedback! Please share your thoughts to help us improve our services.',
      feedbackType: 'Feedback Type',
      types: {
        general: 'General',
        bug: 'Bug Report',
        feature: 'Feature Request',
        other: 'Other'
      },
      rating: 'Rating',
      message: 'Message',
      messagePlaceholder: 'Please share your feedback here...',
      submit: 'Submit Feedback',
      cancel: 'Cancel'
    },
    auth: {
      login: {
        title: 'Login',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: 'Your password',
        submit: 'Login',
        success: 'Logged in successfully',
        error: 'Failed to login'
      },
      signup: {
        title: 'Sign Up',
        name: 'Name',
        namePlaceholder: 'Your name',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: 'Your password',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: 'Confirm your password',
        submit: 'Sign Up',
        success: 'Account created successfully',
        error: 'Failed to create account',
        validation: {
          nameLength: 'Name must be at least 2 characters',
          invalidEmail: 'Invalid email',
          passwordLength: 'Password must be at least 6 characters',
          passwordMatch: 'Passwords did not match'
        }
      }
    }
  },
  fr: {
    header: {
      login: 'Connexion',
      signup: 'S\'inscrire',
      resources: 'Ressources',
      assistant: 'Assistant',
      feedback: 'Rétroaction',
      account: {
        profile: 'Profil',
        settings: 'Paramètres',
        deleteAccount: 'Supprimer le compte',
        logout: 'Déconnexion'
      }
    },
    chat: {
      title: 'Discuter avec l\'assistant',
      newChat: 'Nouvelle conversation',
      startConversation: 'Démarrer une nouvelle conversation',
      noConversations: 'Aucune conversation',
      sendMessage: 'Envoyer',
      typeMessage: 'Tapez votre message...',
      loading: 'L\'assistant écrit...',
      errorMessage: 'Échec de l\'envoi du message',
      retryButton: 'Réessayer',
      deleteConversation: 'Supprimer la conversation',
      conversationDeleted: 'Conversation supprimée avec succès'
    },
    resources: {
      title: 'Ressources en santé mentale',
      description: 'Trouvez du soutien et de l\'aide quand vous en avez besoin',
      emergency: 'Urgence',
      callButton: 'Appeler',
      textButton: 'Texto',
      websiteButton: 'Site web',
      1: {
        name: 'Services d\'urgence 911',
        description: 'Pour une assistance immédiate en cas d\'urgence. Disponible 24/7 pour les situations mettant la vie en danger et les crises de santé mentale graves.'
      },
      2: {
        name: 'Ligne de prévention du suicide et de crise 988',
        description: 'Soutien confidentiel 24/7 pour toute personne en détresse liée à la santé mentale ou ayant des pensées suicidaires.'
      },
      3: {
        name: 'Santé et mieux-être uOttawa',
        description: 'Services professionnels de counseling et de soutien en santé mentale pour les étudiants de l\'uOttawa.'
      }
    },
    feedback: {
      title: 'Partagez vos commentaires',
      description: 'Nous apprécions vos commentaires ! Partagez vos pensées pour nous aider à améliorer nos services.',
      feedbackType: 'Type de commentaire',
      types: {
        general: 'Général',
        bug: 'Rapport de bug',
        feature: 'Suggestion de fonctionnalité',
        other: 'Autre'
      },
      rating: 'Évaluation',
      message: 'Message',
      messagePlaceholder: 'Veuillez partager vos commentaires ici...',
      submit: 'Envoyer',
      cancel: 'Annuler'
    },
    auth: {
      login: {
        title: 'Connexion',
        email: 'Courriel',
        emailPlaceholder: 'votre@courriel.com',
        password: 'Mot de passe',
        passwordPlaceholder: 'Votre mot de passe',
        submit: 'Se connecter',
        success: 'Connexion réussie',
        error: 'Échec de la connexion'
      },
      signup: {
        title: 'Inscription',
        name: 'Nom',
        namePlaceholder: 'Votre nom',
        email: 'Courriel',
        emailPlaceholder: 'votre@courriel.com',
        password: 'Mot de passe',
        passwordPlaceholder: 'Votre mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        confirmPasswordPlaceholder: 'Confirmer votre mot de passe',
        submit: 'S\'inscrire',
        success: 'Compte créé avec succès',
        error: 'Échec de la création du compte',
        validation: {
          nameLength: 'Le nom doit contenir au moins 2 caractères',
          invalidEmail: 'Courriel invalide',
          passwordLength: 'Le mot de passe doit contenir au moins 6 caractères',
          passwordMatch: 'Les mots de passe ne correspondent pas'
        }
      }
    }
  }
}; 