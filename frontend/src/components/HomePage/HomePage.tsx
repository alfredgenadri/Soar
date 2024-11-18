import { Container, Title, Text, Button, Group, Card } from '@mantine/core';
import { IconArrowRight, IconHeartHandshake, IconBrain, IconUserCircle } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import classes from './HomePage.module.css';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={classes.wrapper}>
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            Supporting <span className={classes.highlight}>You</span> <br />
            Every Step of the Way
          </Title>

          <Text className={classes.description}>
            Our platform offers personalized mental health support and resources, 
            with a 24/7 AI companion ready to listen and guide you on your journey 
            to better mental well-being.
          </Text>

          <Group className={classes.controls}>
            <Button 
              size="xl" 
              className={classes.control} 
              rightSection={<IconArrowRight size={20} />}
              onClick={() => navigate('/chat')}
            >
              Talk to Assistant
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              rightSection={<IconArrowRight size={20} />}
              onClick={() => navigate('/resources')}
            >
              Access Resources
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
                <Text className={classes.featureTitle}>24/7 AI Support</Text>
                <Text className={classes.featureText}>
                  Access immediate emotional support and guidance whenever you need it. Our AI companion 
                  is always available to listen, provide coping strategies, and offer personalized 
                  support for your mental well-being journey.
                </Text>
              </Card>
            </Carousel.Slide>
            
            <Carousel.Slide>
              <Card className={classes.featureCard}>
                <IconBrain className={classes.featureIcon} stroke={1.5} size={80} />
                <Text className={classes.featureTitle}>Resource Library</Text>
                <Text className={classes.featureText}>
                  Explore our comprehensive collection of mental health resources, including articles, 
                  exercises, and professional guidance. Find tools and strategies tailored to your 
                  specific needs and circumstances.
                </Text>
              </Card>
            </Carousel.Slide>
            
            <Carousel.Slide>
              <Card className={classes.featureCard}>
                <IconUserCircle className={classes.featureIcon} stroke={1.5} size={80} />
                <Text className={classes.featureTitle}>Personalized Care</Text>
                <Text className={classes.featureText}>
                  Experience support that adapts to you. Our platform learns from your interactions 
                  to provide increasingly personalized guidance and recommendations, ensuring you 
                  receive the most relevant and effective support.
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