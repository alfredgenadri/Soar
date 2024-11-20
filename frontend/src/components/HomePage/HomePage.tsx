import { Container, Title, Text, Button, Group, Card } from '@mantine/core';
import { IconArrowRight, IconHeartHandshake, IconBrain, IconUserCircle } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import classes from './HomePage.module.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className={classes.wrapper}>
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title order={1} className={classes.title}>
            {t('homepage.title.supporting')} <span className={classes.highlight}>{t('homepage.title.you')}</span> <br />
            {t('homepage.title.everyStep')}
          </Title>

          <Text className={classes.description}>
            {t('homepage.description')}
          </Text>

          <Group className={classes.controls}>
            <Button 
              size="xl" 
              className={classes.control} 
              rightSection={<IconArrowRight size={20} />}
              onClick={() => navigate('/chat')}
            >
              {t('homepage.buttons.talkToAssistant')}
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              rightSection={<IconArrowRight size={20} />}
              onClick={() => navigate('/resources')}
            >
              {t('homepage.buttons.accessResources')}
            </Button>
          </Group>
        </div>

        <div className={classes.carouselWrapper}>
          <Carousel
            withIndicators
            height={400}
            slideSize="100%"
            slideGap="lg"
            controlSize={32}
            loop
            align="start"
            styles={{
              root: {
                width: '100%',
              },
              slide: {
                height: 'rem(280px)',
              },
              viewport: {
                padding: '10px 0',
              },
              control: {
                backgroundColor: 'var(--mantine-color-white)',
                border: '1px solid var(--mantine-color-gray-2)',
                color: 'var(--mantine-color-dark-6)',
                '&:hover': {
                  backgroundColor: 'var(--mantine-color-gray-0)',
                },
              },
              indicators: {
                bottom: -40,
              },
              indicator: {
                width: 40,
                height: 4,
                transition: 'width 250ms ease',
                backgroundColor: 'var(--mantine-color-gray-2)',
                '&[data-active]': {
                  width: 60,
                  backgroundColor: 'var(--mantine-color-blue-6)',
                },
              },
            }}
          >
            <Carousel.Slide>
              <Card className={classes.featureCard}>
                <IconHeartHandshake className={classes.featureIcon} stroke={1.5} size={80} />
                <Text className={classes.featureTitle}>{t('homepage.features.aiSupport.title')}</Text>
                <Text className={classes.featureText}>
                  {t('homepage.features.aiSupport.description')}
                </Text>
              </Card>
            </Carousel.Slide>
            
            <Carousel.Slide>
              <Card className={classes.featureCard}>
                <IconBrain className={classes.featureIcon} stroke={1.5} size={80} />
                <Text className={classes.featureTitle}>{t('homepage.features.resources.title')}</Text>
                <Text className={classes.featureText}>
                  {t('homepage.features.resources.description')}
                </Text>
              </Card>
            </Carousel.Slide>
            
            <Carousel.Slide>
              <Card className={classes.featureCard}>
                <IconUserCircle className={classes.featureIcon} stroke={1.5} size={80} />
                <Text className={classes.featureTitle}>{t('homepage.features.personalizedCare.title')}</Text>
                <Text className={classes.featureText}>
                  {t('homepage.features.personalizedCare.description')}
                </Text>
              </Card>
            </Carousel.Slide>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export default HomePage;