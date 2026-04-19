import type { ReactElement } from 'react';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { Avatar } from '../components/ui/Avatar';
import { NotFoundPage } from './NotFoundPage';
import teams from '../data/teamsHardcodedSample.json';
import './TeamsPage.scss';

interface Team {
  id: string;
  name: string;
  avatarUrl: string;
}

export const TeamsPage = (): ReactElement => {
  const teamsEnabled: boolean | undefined = useFeatureFlagEnabled('teams');

  if (teamsEnabled !== true) {
    return <NotFoundPage />;
  }

  const teamList: Team[] = teams as Team[];

  return (
    <div className="teams-page">
      <h2 className="teams-page__title">Teams</h2>

      <table className="teams-page__table">
        <tbody>
          {teamList.map((team) => (
            <tr key={team.id}>
              <td className="teams-page__avatar-cell">
                <Avatar src={team.avatarUrl} alt={team.name} size="s" />
              </td>
              <td className="teams-page__name-cell">{team.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
