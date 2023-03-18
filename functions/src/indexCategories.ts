import {db} from './firebaseadmin';

export const indexCategoriesCallable = async () => {
  const categoryResources: {[p: string]: string[]} = {};
  const resourcesSnapshot = await db.ref('/resources').get();
  resourcesSnapshot.forEach(child => {
    for (const categoryKey of child.val().categoryKeys ?? []) {
      if (!categoryResources[categoryKey]) categoryResources[categoryKey] = [];
      categoryResources[categoryKey].push(child.key!);
    }
  });

  for (const categoryKey in categoryResources) {
    await db.ref(`/categories/${categoryKey}/resources`).set(categoryResources[categoryKey]);
  }
};
