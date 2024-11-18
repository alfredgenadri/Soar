import { Container, Title, Text, Button, Group, Card } from '@mantine/core';
import { IconArrowRight, IconHeartHandshake, IconBrain, IconUserCircle } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import classes from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={classes.wrapper}>
      <Container size="lg">
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
              >
                Talk to Us
              </Button>
            </Group>
          </div>

          <div className={classes.carouselWrapper}>
            <Carousel
              withIndicators
              height={320}
              slideSize="100%"
              slideGap="md"
              controlSize={32}
              align="start"
              styles={{
                root: {
                  width: '100%',
                },
                viewport: {
                  padding: '10px 0',
                },
                control: {
                  backgroundColor: 'var(--mantine-color-blue-1)',
                  border: '1px solid var(--mantine-color-blue-3)',
                  color: 'var(--mantine-color-blue-6)',
                  '&:hover': {
                    backgroundColor: 'var(--mantine-color-blue-2)',
                  },
                },
                indicators: {
                  bottom: -40,
                },
                indicator: {
                  width: 40,
                  height: 4,
                  transition: 'width 250ms ease, background-color 250ms ease',
                  backgroundColor: 'var(--mantine-color-blue-2)',
                  '&[data-active]': {
                    width: 60,
                    backgroundColor: 'var(--mantine-color-blue-6)',
                  },
                },
              }}
            >
              <Carousel.Slide>
                <Card className={classes.featureCard}>
                  <IconHeartHandshake className={classes.featureIcon} stroke={1.5} />
                  <Text className={classes.featureTitle}>24/7 AI Support</Text>
                  <Text className={classes.featureText}>
                    Always here to listen and provide guidance when you need it most
                  </Text>
                </Card>
              </Carousel.Slide>
              
              <Carousel.Slide>
                <Card className={classes.featureCard}>
                  <IconBrain className={classes.featureIcon} stroke={1.5} />
                  <Text className={classes.featureTitle}>Resource Library</Text>
                  <Text className={classes.featureText}>
                    Access to comprehensive mental health resources and information
                  </Text>
                </Card>
              </Carousel.Slide>
              
              <Carousel.Slide>
                <Card className={classes.featureCard}>
                  <IconUserCircle className={classes.featureIcon} stroke={1.5} />
                  <Text className={classes.featureTitle}>Personalized Care</Text>
                  <Text className={classes.featureText}>
                    Tailored support that adapts to your unique needs and journey
                  </Text>
                </Card>
              </Carousel.Slide>
            </Carousel>
          </div>
        </div>
      </Container>

      <div className={classes.background}>
        <div className={classes.backgroundGradient} />
      </div>
    </div>
  );
}

export default HomePage;