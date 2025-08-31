import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProjectProvider } from '../contexts/ProjectContext';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <ProjectProvider>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            textAlign: 'right',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'أكاد للتفتيش',
            headerLargeTitle: false,
          }} 
        />
        <Stack.Screen 
          name="project/[id]" 
          options={{ 
            title: 'تفاصيل المشروع',
          }} 
        />
        <Stack.Screen 
          name="create-project" 
          options={{ 
            title: 'مشروع جديد',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="edit-project/[id]" 
          options={{ 
            title: 'تعديل المشروع',
            presentation: 'modal',
          }} 
        />
      </Stack>
    </ProjectProvider>
  );
}