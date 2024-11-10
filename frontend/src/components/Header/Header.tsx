import cx from 'clsx';
import { useState } from 'react';
import {
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  rem,
  Button,
  useMantineTheme,
  SegmentedControl,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogout,
  IconHeart,
  IconSettings,
  IconSwitchHorizontal,
  IconTrash,
  IconChevronDown,
} from '@tabler/icons-react';
import { LoginModal } from '../Auth/LoginModal';
import { SignupModal } from '../Auth/SignupModal';
import { useAuth } from '../../contexts/AuthContext';
import { FeedbackModal } from '../Feedback/FeedbackModal';
import { useLanguage } from '../../contexts/LanguageContext';

import classes from './Header.module.css';

const tabs = ['Resources', 'Assistant', 'Feedback'];

export function Header() {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [loginModalOpened, setLoginModalOpened] = useState(false);
  const [signupModalOpened, setSignupModalOpened] = useState(false);
  const [feedbackModalOpened, setFeedbackModalOpened] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const tabs = [t('header.resources'), t('header.assistant'), t('header.feedback')];

  const items = tabs.map((tab) => (
    <Tabs.Tab 
      value={tab} 
      key={tab}
      onClick={() => handleTabClick(tab)}
    >
      {tab}
    </Tabs.Tab>
  ));

  const handleTabClick = (tab: string) => {
    if (tab === t('header.feedback')) {
      setFeedbackModalOpened(true);
    }
  };

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="md">
        <Group justify="space-between">
        
        <Tabs
          defaultValue="Home"
          variant="outline"
          visibleFrom="sm"
          classNames={{
            root: classes.tabs,
            list: classes.tabsList,
            tab: classes.tab,
          }}
        >
          <Tabs.List>{items}</Tabs.List>
        </Tabs>
      

          <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />

          {isAuthenticated ? (
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                >
                  <Group gap={7}>
                    <Avatar src={user?.image} alt={user?.name} radius="xl" size={20} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user?.name}
                    </Text>
                    <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('header.account.settings')}</Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                >
                  {t('header.account.profile')}
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconSwitchHorizontal style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                >
                  {t('header.account.settings')}
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                  }
                  onClick={logout}
                >
                  {t('header.account.logout')}
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                >
                  {t('header.account.deleteAccount')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap="sm">
              <Button variant="subtle" onClick={() => setLoginModalOpened(true)}>
                {t('header.login')}
              </Button>
              <Button onClick={() => setSignupModalOpened(true)}>
                {t('header.signup')}
              </Button>
              <SegmentedControl
                value={language}
                onChange={(value: string) => setLanguage(value as 'en' | 'fr')}
                data={[
                  { label: 'EN', value: 'en' },
                  { label: 'FR', value: 'fr' }
                ]}
              />
            </Group>
          )}
        </Group>
      </Container>

      <LoginModal opened={loginModalOpened} onClose={() => setLoginModalOpened(false)} />
      <SignupModal opened={signupModalOpened} onClose={() => setSignupModalOpened(false)} />
      <FeedbackModal opened={feedbackModalOpened} onClose={() => setFeedbackModalOpened(false)} />
        
    </div>
  );
}
